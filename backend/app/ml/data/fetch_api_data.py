"""
Fetch enrichment data from O*NET API and JSearch API.

Creates a local cache under  backend/app/ml/data/api_cache/  that the
skill data processor merges with the existing Excel / JSON / CSV sources
to produce a richer vocabulary and denser training vectors.

Usage (from the repo root):
    python -m backend.app.ml.data.fetch_api_data              # fetch all
    python -m backend.app.ml.data.fetch_api_data --onet-only  # O*NET only
    python -m backend.app.ml.data.fetch_api_data --jsearch-only  # JSearch only

The script is **resumable**: it caches each occupation individually, so
an interrupted run picks up where it left off on the next invocation.
"""

import os
import sys
import json
import time
import argparse
import logging
from typing import Dict, List, Any, Optional

import requests
from dotenv import load_dotenv

# Load .env from project root
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '.env')
load_dotenv(dotenv_path=_env_path)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_CACHE_DIR = os.path.join(_BASE_DIR, "api_cache")
_ONET_CACHE = os.path.join(_CACHE_DIR, "onet")
_ONET_DETAILS_DIR = os.path.join(_ONET_CACHE, "occupation_details")
_JSEARCH_CACHE = os.path.join(_CACHE_DIR, "jsearch")

# ---------------------------------------------------------------------------
# API credentials
# ---------------------------------------------------------------------------
ONET_BASE = "https://api-v2.onetcenter.org"
ONET_HEADERS = {
    "X-API-Key": os.getenv("ONET_API_KEY", ""),
    "Accept": "application/json",
}

JSEARCH_BASE = "https://jsearch.p.rapidapi.com"
JSEARCH_HEADERS = {
    "x-rapidapi-host": "jsearch.p.rapidapi.com",
    "x-rapidapi-key": os.getenv("JSEARCH_API_KEY", ""),
}

# ---------------------------------------------------------------------------
# Default JSearch queries — diverse tech roles
# ---------------------------------------------------------------------------
DEFAULT_JSEARCH_QUERIES = [
    "data scientist",
    "python developer",
    "machine learning engineer",
    "devops engineer",
    "full stack developer",
    "backend developer",
    "frontend developer",
    "cloud architect",
    "data engineer",
    "cybersecurity analyst",
    "AI engineer",
    "java developer",
    "react developer",
    "database administrator",
    "network engineer",
    "mobile app developer",
    "QA automation engineer",
    "site reliability engineer",
    "blockchain developer",
    "embedded systems engineer",
]


# =========================================================================
# O*NET API Fetcher
# =========================================================================
class OnetFetcher:
    """Fetch technology skills for all O*NET occupations."""

    def __init__(self, delay: float = 0.4):
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update(ONET_HEADERS)
        os.makedirs(_ONET_DETAILS_DIR, exist_ok=True)

    def _get(self, path: str, params: dict = None) -> Optional[dict]:
        """Make a GET request with retry logic."""
        url = f"{ONET_BASE}{path}"
        for attempt in range(3):
            try:
                r = self.session.get(url, params=params, timeout=30)
                if r.status_code == 200:
                    return r.json()
                if r.status_code == 422:
                    return None  # invalid occupation code
                if r.status_code == 429:
                    wait = (attempt + 1) * 30
                    logger.warning(f"Rate limited, waiting {wait}s...")
                    time.sleep(wait)
                    continue
                logger.warning(f"HTTP {r.status_code} for {url}")
                return None
            except requests.RequestException as e:
                logger.warning(f"Request error (attempt {attempt+1}): {e}")
                time.sleep(5)
        return None

    # ------------------------------------------------------------------
    def fetch_occupation_list(self) -> List[Dict[str, str]]:
        """Fetch the full list of O*NET occupations (paginated)."""
        cache_path = os.path.join(_ONET_CACHE, "occupations_list.json")
        if os.path.exists(cache_path):
            with open(cache_path, "r", encoding="utf-8") as f:
                cached = json.load(f)
            logger.info(f"Loaded cached occupation list: {len(cached)} occupations")
            return cached

        occupations = []
        start = 1
        while True:
            data = self._get("/online/occupations/", {"start": start, "end": start + 19})
            if not data:
                break
            for occ in data.get("occupation", []):
                occupations.append({
                    "code": occ.get("code", ""),
                    "title": occ.get("title", ""),
                })
            total = data.get("total", 0)
            end = data.get("end", 0)
            if end >= total:
                break
            start = end + 1
            time.sleep(self.delay)

        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(occupations, f, indent=2)
        logger.info(f"Fetched occupation list: {len(occupations)} occupations")
        return occupations

    # ------------------------------------------------------------------
    def _fetch_tech_skills(self, occ_code: str) -> List[Dict]:
        """Fetch ALL technology skills for an occupation (paginated)."""
        all_skills = []
        start = 1
        while True:
            data = self._get(
                f"/online/occupations/{occ_code}/summary/technology_skills",
                {"start": start, "end": start + 19},
            )
            if not data:
                break
            for cat in data.get("category", []):
                cat_title = cat.get("title", "")
                # 'example' = main examples (hot / in-demand flagged)
                for ex in cat.get("example", []):
                    all_skills.append({
                        "name": str(ex.get("title", "")).strip(),
                        "category": cat_title,
                        "hot": bool(ex.get("hot_technology", False)),
                        "in_demand": bool(ex.get("in_demand", False)),
                    })
                # 'example_more' = additional examples (not hot / not in-demand)
                for ex in cat.get("example_more", []):
                    all_skills.append({
                        "name": str(ex.get("title", "")).strip(),
                        "category": cat_title,
                        "hot": False,
                        "in_demand": False,
                    })
            total = data.get("total", 0)
            end_pos = data.get("end", 0)
            if end_pos >= total:
                break
            start = end_pos + 1
            time.sleep(self.delay)
        return all_skills

    def _fetch_skills(self, occ_code: str) -> List[Dict]:
        """Fetch core skills for an occupation (paginated)."""
        all_skills = []
        start = 1
        while True:
            data = self._get(
                f"/online/occupations/{occ_code}/summary/skills",
                {"start": start, "end": start + 19},
            )
            if not data:
                break
            for el in data.get("element", []):
                name = str(el.get("name", "")).strip()
                score_val = float(el.get("score", {}).get("value", 0) or 0)
                all_skills.append({"name": name, "score": score_val})
            total = data.get("total", 0)
            end_pos = data.get("end", 0)
            if end_pos >= total:
                break
            start = end_pos + 1
            time.sleep(self.delay)
        return all_skills

    def _fetch_knowledge(self, occ_code: str) -> List[Dict]:
        """Fetch knowledge areas for an occupation (paginated)."""
        all_knowledge = []
        start = 1
        while True:
            data = self._get(
                f"/online/occupations/{occ_code}/summary/knowledge",
                {"start": start, "end": start + 19},
            )
            if not data:
                break
            for el in data.get("element", []):
                name = str(el.get("name", "")).strip()
                score_val = float(el.get("score", {}).get("value", 0) or 0)
                all_knowledge.append({"name": name, "score": score_val})
            total = data.get("total", 0)
            end_pos = data.get("end", 0)
            if end_pos >= total:
                break
            start = end_pos + 1
            time.sleep(self.delay)
        return all_knowledge

    # ------------------------------------------------------------------
    def fetch_occupation_details(self, occ_code: str) -> Dict:
        """Fetch full details for one occupation (with caching)."""
        safe_code = occ_code.replace("/", "_")
        cache_file = os.path.join(_ONET_DETAILS_DIR, f"{safe_code}.json")

        if os.path.exists(cache_file):
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)

        detail = {
            "code": occ_code,
            "tech_skills": self._fetch_tech_skills(occ_code),
            "skills": self._fetch_skills(occ_code),
            "knowledge": self._fetch_knowledge(occ_code),
        }

        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(detail, f, indent=2)
        return detail

    # ------------------------------------------------------------------
    def fetch_all(self) -> None:
        """Fetch occupation list + details for every occupation."""
        occupations = self.fetch_occupation_list()
        total = len(occupations)

        # Count how many are already cached
        already_done = sum(
            1 for occ in occupations
            if os.path.exists(
                os.path.join(_ONET_DETAILS_DIR, f"{occ['code'].replace('/', '_')}.json")
            )
        )
        remaining = total - already_done
        logger.info(
            f"O*NET: {already_done}/{total} already cached, "
            f"{remaining} remaining (~{remaining * 3 * 0.4 / 60:.0f} min)"
        )

        done = 0
        for i, occ in enumerate(occupations, 1):
            code = occ["code"]
            safe_code = code.replace("/", "_")
            cache_file = os.path.join(_ONET_DETAILS_DIR, f"{safe_code}.json")

            if os.path.exists(cache_file):
                continue  # already fetched

            detail = self.fetch_occupation_details(code)
            done += 1
            tech_count = len(detail.get("tech_skills", []))
            hot_count = sum(1 for t in detail.get("tech_skills", []) if t.get("hot"))

            if done % 25 == 0 or done <= 3:
                elapsed_est = done * 3 * self.delay
                logger.info(
                    f"  [{done}/{remaining}] {code} {occ['title']}: "
                    f"{tech_count} tech ({hot_count} hot), "
                    f"{len(detail.get('skills',[]))} skills, "
                    f"{len(detail.get('knowledge',[]))} knowledge"
                )

        logger.info(f"O*NET fetch complete: {total} occupations cached")


# =========================================================================
# JSearch API Fetcher
# =========================================================================
class JSearchFetcher:
    """Fetch job listings from JSearch (RapidAPI)."""

    def __init__(self, delay: float = 1.2):
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update(JSEARCH_HEADERS)
        os.makedirs(_JSEARCH_CACHE, exist_ok=True)

    def _get(self, params: dict) -> Optional[dict]:
        """Make a GET request with retry."""
        for attempt in range(3):
            try:
                r = self.session.get(
                    f"{JSEARCH_BASE}/search",
                    params=params,
                    timeout=30,
                )
                if r.status_code == 200:
                    return r.json()
                if r.status_code == 429:
                    wait = (attempt + 1) * 60
                    logger.warning(f"JSearch rate limited, waiting {wait}s...")
                    time.sleep(wait)
                    continue
                logger.warning(f"JSearch HTTP {r.status_code}")
                return None
            except requests.RequestException as e:
                logger.warning(f"JSearch request error: {e}")
                time.sleep(5)
        return None

    def fetch_jobs(
        self,
        queries: List[str] = None,
        country: str = "in",
        pages_per_query: int = 5,
    ) -> None:
        """Fetch jobs for multiple queries and accumulate in cache."""
        queries = queries or DEFAULT_JSEARCH_QUERIES

        # Load existing accumulated jobs
        acc_path = os.path.join(_JSEARCH_CACHE, "accumulated_jobs.json")
        log_path = os.path.join(_JSEARCH_CACHE, "query_log.json")

        existing_jobs: Dict[str, dict] = {}
        if os.path.exists(acc_path):
            with open(acc_path, "r", encoding="utf-8") as f:
                for job in json.load(f):
                    existing_jobs[job["job_id"]] = job
        logger.info(f"JSearch: {len(existing_jobs)} jobs already cached")

        # Load query log
        query_log: List[str] = []
        if os.path.exists(log_path):
            with open(log_path, "r", encoding="utf-8") as f:
                query_log = json.load(f)

        new_jobs = 0
        for q_idx, query in enumerate(queries, 1):
            query_key = f"{query}|{country}"
            if query_key in query_log:
                logger.info(f"  Skipping already-run query: '{query}' ({country})")
                continue

            logger.info(f"  [{q_idx}/{len(queries)}] Querying: '{query}' ({country})...")
            for page in range(1, pages_per_query + 1):
                data = self._get({
                    "query": f"{query} jobs in {country}",
                    "page": str(page),
                    "num_pages": "1",
                    "country": country,
                    "date_posted": "all",
                })
                if not data or not data.get("data"):
                    break  # no more results

                for job in data["data"]:
                    job_id = job.get("job_id")
                    if not job_id or job_id in existing_jobs:
                        continue
                    # Store only the fields we need
                    existing_jobs[job_id] = {
                        "job_id": job_id,
                        "job_title": job.get("job_title", ""),
                        "job_description": job.get("job_description", ""),
                        "job_onet_soc": job.get("job_onet_soc"),
                        "employer_name": job.get("employer_name", ""),
                        "job_highlights": job.get("job_highlights", []),
                    }
                    new_jobs += 1

                time.sleep(self.delay)

            query_log.append(query_key)

            # Save progress after each query
            with open(acc_path, "w", encoding="utf-8") as f:
                json.dump(list(existing_jobs.values()), f, indent=1)
            with open(log_path, "w", encoding="utf-8") as f:
                json.dump(query_log, f, indent=2)

        logger.info(
            f"JSearch fetch complete: {new_jobs} new jobs, "
            f"{len(existing_jobs)} total accumulated"
        )


# =========================================================================
# SOC Code Crosswalk
# =========================================================================
def build_soc_crosswalk(jsearch_jobs: List[Dict]) -> Dict[str, str]:
    """Build a mapping from JSearch SOC codes to O*NET occupation codes.

    JSearch uses 2010 SOC codes (e.g. '15113200'), O*NET uses 2019 SOC
    codes (e.g. '15-1252.00').  We try direct lookup first, then fall
    back to the O*NET search API.
    """
    crosswalk_path = os.path.join(_CACHE_DIR, "soc_crosswalk.json")
    if os.path.exists(crosswalk_path):
        with open(crosswalk_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # Collect unique JSearch SOC codes
    unique_soc = set()
    for job in jsearch_jobs:
        soc = job.get("job_onet_soc")
        if soc:
            unique_soc.add(str(soc))

    logger.info(f"Building SOC crosswalk for {len(unique_soc)} unique codes...")
    crosswalk: Dict[str, str] = {}
    session = requests.Session()
    session.headers.update(ONET_HEADERS)

    for soc in sorted(unique_soc):
        # Format: 15113200 → 15-1132.00
        if len(soc) == 8:
            formatted = f"{soc[0:2]}-{soc[2:6]}.{soc[6:8]}"
        else:
            formatted = soc

        # Try direct lookup
        try:
            r = session.get(
                f"{ONET_BASE}/online/occupations/{formatted}/",
                timeout=15,
            )
            if r.status_code == 200:
                crosswalk[soc] = formatted
                time.sleep(0.3)
                continue
        except requests.RequestException:
            pass

        # Fall back to search
        try:
            prefix = f"{soc[0:2]}-{soc[2:6]}" if len(soc) == 8 else soc[:7]
            r = session.get(
                f"{ONET_BASE}/online/search",
                params={"keyword": prefix},
                timeout=15,
            )
            if r.status_code == 200:
                results = r.json().get("occupation", [])
                if results:
                    crosswalk[soc] = results[0]["code"]
        except requests.RequestException:
            pass

        time.sleep(0.3)

    with open(crosswalk_path, "w", encoding="utf-8") as f:
        json.dump(crosswalk, f, indent=2)
    logger.info(f"SOC crosswalk built: {len(crosswalk)}/{len(unique_soc)} mapped")
    return crosswalk


# =========================================================================
# CLI
# =========================================================================
def main():
    parser = argparse.ArgumentParser(description="Fetch API data for ML enrichment")
    parser.add_argument("--onet-only", action="store_true", help="Only fetch O*NET data")
    parser.add_argument("--jsearch-only", action="store_true", help="Only fetch JSearch data")
    parser.add_argument("--jsearch-pages", type=int, default=5, help="Pages per JSearch query")
    parser.add_argument("--jsearch-country", default="in", help="Country code for JSearch")
    parser.add_argument("--delay", type=float, default=0.4, help="Delay between O*NET requests (sec)")
    args = parser.parse_args()

    os.makedirs(_CACHE_DIR, exist_ok=True)
    t0 = time.time()

    fetch_onet = not args.jsearch_only
    fetch_jsearch = not args.onet_only

    # ---- O*NET ----
    if fetch_onet:
        logger.info("=" * 60)
        logger.info("Phase 1: Fetching O*NET occupation data...")
        logger.info("=" * 60)
        fetcher = OnetFetcher(delay=args.delay)
        fetcher.fetch_all()

    # ---- JSearch ----
    if fetch_jsearch:
        logger.info("=" * 60)
        logger.info("Phase 2: Fetching JSearch job listings...")
        logger.info("=" * 60)
        jfetcher = JSearchFetcher(delay=1.2)
        jfetcher.fetch_jobs(
            country=args.jsearch_country,
            pages_per_query=args.jsearch_pages,
        )

        # ---- SOC Crosswalk ----
        acc_path = os.path.join(_JSEARCH_CACHE, "accumulated_jobs.json")
        if os.path.exists(acc_path):
            with open(acc_path, "r", encoding="utf-8") as f:
                jobs = json.load(f)
            logger.info("=" * 60)
            logger.info("Phase 3: Building SOC code crosswalk...")
            logger.info("=" * 60)
            build_soc_crosswalk(jobs)

    elapsed = time.time() - t0
    logger.info(f"\nAll done in {elapsed / 60:.1f} minutes.")

    # Print summary
    _print_summary()


def _print_summary():
    """Print a summary of cached data."""
    print("\n" + "=" * 60)
    print("API Cache Summary")
    print("=" * 60)

    # O*NET
    occ_list_path = os.path.join(_ONET_CACHE, "occupations_list.json")
    if os.path.exists(occ_list_path):
        with open(occ_list_path) as f:
            occs = json.load(f)
        print(f"O*NET occupations listed: {len(occs)}")

    detail_dir = _ONET_DETAILS_DIR
    if os.path.exists(detail_dir):
        detail_files = [f for f in os.listdir(detail_dir) if f.endswith(".json")]
        print(f"O*NET occupation details cached: {len(detail_files)}")

        # Sample stats
        total_tech = 0
        total_hot = 0
        for fname in detail_files[:50]:
            with open(os.path.join(detail_dir, fname)) as f:
                d = json.load(f)
            total_tech += len(d.get("tech_skills", []))
            total_hot += sum(1 for t in d.get("tech_skills", []) if t.get("hot"))
        if detail_files:
            sampled = min(50, len(detail_files))
            print(f"  Sample ({sampled} occs): avg {total_tech/sampled:.0f} tech skills, "
                  f"avg {total_hot/sampled:.0f} hot")

    # JSearch
    acc_path = os.path.join(_JSEARCH_CACHE, "accumulated_jobs.json")
    if os.path.exists(acc_path):
        with open(acc_path) as f:
            jobs = json.load(f)
        print(f"JSearch jobs accumulated: {len(jobs)}")

    # Crosswalk
    cw_path = os.path.join(_CACHE_DIR, "soc_crosswalk.json")
    if os.path.exists(cw_path):
        with open(cw_path) as f:
            cw = json.load(f)
        print(f"SOC crosswalk entries: {len(cw)}")

    print("=" * 60)


if __name__ == "__main__":
    main()
