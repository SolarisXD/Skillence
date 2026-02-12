"""
Skill Data Processor for Model 3: Skill Recommender Autoencoder.

Reads O*NET data (Technology Skills, Skills, Knowledge, Occupation Data)
and the AI job dataset CSV, builds a unified skill vocabulary, and produces
binary skill-occupation vectors suitable for autoencoder training.

Output artefacts (saved to  backend/app/ml/data/processed/):
    - skill_vectors.npy        : (N, V) binary matrix  (N = samples, V = vocab size)
    - occupation_labels.json   : list[str] mapping row index → occupation code or job id
    - skill_index.json         : dict[str, int]  skill_name → column index
    - vocab_metadata.json      : summary stats about the vocabulary
"""

import os
import re
import json
import logging
from typing import Dict, List, Tuple, Any, Set
from collections import Counter

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_CAREER_DATA = os.path.normpath(os.path.join(_BASE_DIR, "../../career_data"))
_SKILLS_DATA = os.path.join(_CAREER_DATA, "skills_data")
_JOB_CSV     = os.path.join(_CAREER_DATA, "job_trend_data", "ai_job_dataset.csv")
_ONET_JSON   = os.path.join(_CAREER_DATA, "onet_occupations_data.json")
_OUTPUT_DIR  = os.path.join(_BASE_DIR, "processed")

# API cache paths (populated by fetch_api_data.py)
_API_CACHE       = os.path.join(_BASE_DIR, "api_cache")
_ONET_CACHE      = os.path.join(_API_CACHE, "onet")
_ONET_DETAILS    = os.path.join(_ONET_CACHE, "occupation_details")
_JSEARCH_CACHE   = os.path.join(_API_CACHE, "jsearch")
_JSEARCH_JOBS    = os.path.join(_JSEARCH_CACHE, "accumulated_jobs.json")
_SOC_CROSSWALK   = os.path.join(_API_CACHE, "soc_crosswalk.json")

# Minimum number of occupations a non-hot tech skill must appear in
# to be included in the vocabulary
_MIN_TECH_FREQUENCY = 10

# Skill aliases for JSearch description extraction
_SKILL_ALIASES = {
    "golang": "go",
    "js": "javascript",
    "ts": "typescript",
    "k8s": "kubernetes",
    "postgres": "postgresql",
    "mongo": "mongodb",
    "react.js": "react",
    "reactjs": "react",
    "node.js": "node.js",
    "nodejs": "node.js",
    "vue.js": "vue.js",
    "vuejs": "vue.js",
    "express.js": "express",
    "expressjs": "express",
    "next.js": "next.js",
    "nextjs": "next.js",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "aws": "amazon web services aws software",
    "gcp": "google cloud platform",
    "azure": "microsoft azure",
}


class SkillDataProcessor:
    """Build unified skill vocabulary and binary vectors from O*NET + CSV data."""

    def __init__(self):
        self.tech_skills_df: pd.DataFrame = None
        self.skills_df: pd.DataFrame = None
        self.knowledge_df: pd.DataFrame = None
        self.onet_json: List[Dict[str, Any]] = []
        self.job_csv_df: pd.DataFrame = None

        # API cache data
        self.api_occupation_details: Dict[str, Dict] = {}  # code -> detail dict
        self.jsearch_jobs: List[Dict] = []
        self.soc_crosswalk: Dict[str, str] = {}  # JSearch SOC -> O*NET code

        # Final artefacts
        self.skill_vocab: Dict[str, int] = {}  # skill_name → index
        self.vectors: np.ndarray = None  # (N, V)
        self.labels: List[str] = []  # occupation code / job id per row

    # ------------------------------------------------------------------
    # 1. Load raw data
    # ------------------------------------------------------------------
    def load_data(self) -> None:
        """Load all raw data sources."""
        logger.info("Loading raw data sources...")

        # Technology Skills (Excel)
        tech_path = os.path.join(_SKILLS_DATA, "Technology Skills.xlsx")
        if os.path.exists(tech_path):
            self.tech_skills_df = pd.read_excel(tech_path)
            logger.info(f"Technology Skills: {len(self.tech_skills_df)} rows")
        else:
            logger.warning(f"Technology Skills file not found: {tech_path}")

        # Skills (Excel)
        skills_path = os.path.join(_SKILLS_DATA, "Skills.xlsx")
        if os.path.exists(skills_path):
            self.skills_df = pd.read_excel(skills_path)
            logger.info(f"Skills: {len(self.skills_df)} rows")
        else:
            logger.warning(f"Skills file not found: {skills_path}")

        # Knowledge (Excel)
        knowledge_path = os.path.join(_SKILLS_DATA, "Knowledge.xlsx")
        if os.path.exists(knowledge_path):
            self.knowledge_df = pd.read_excel(knowledge_path)
            logger.info(f"Knowledge: {len(self.knowledge_df)} rows")
        else:
            logger.warning(f"Knowledge file not found: {knowledge_path}")

        # O*NET occupations JSON
        if os.path.exists(_ONET_JSON):
            with open(_ONET_JSON, "r", encoding="utf-8") as f:
                self.onet_json = json.load(f)
            logger.info(f"O*NET JSON: {len(self.onet_json)} occupations")
        else:
            logger.warning(f"O*NET JSON not found: {_ONET_JSON}")

        # AI job dataset CSV
        if os.path.exists(_JOB_CSV):
            self.job_csv_df = pd.read_csv(_JOB_CSV)
            logger.info(f"Job CSV: {len(self.job_csv_df)} rows")
        else:
            logger.warning(f"Job CSV not found: {_JOB_CSV}")

        # ---------- API cache data ----------
        # O*NET API occupation details
        if os.path.exists(_ONET_DETAILS):
            for fname in os.listdir(_ONET_DETAILS):
                if not fname.endswith(".json"):
                    continue
                with open(os.path.join(_ONET_DETAILS, fname), "r", encoding="utf-8") as f:
                    detail = json.load(f)
                code = detail.get("code", fname.replace(".json", ""))
                self.api_occupation_details[code] = detail
            logger.info(f"O*NET API cache: {len(self.api_occupation_details)} occupations")
        else:
            logger.warning("O*NET API cache not found — run fetch_api_data.py first")

        # JSearch accumulated jobs
        if os.path.exists(_JSEARCH_JOBS):
            with open(_JSEARCH_JOBS, "r", encoding="utf-8") as f:
                self.jsearch_jobs = json.load(f)
            logger.info(f"JSearch jobs: {len(self.jsearch_jobs)}")
        else:
            logger.info("JSearch cache not found — skipping")

        # SOC crosswalk
        if os.path.exists(_SOC_CROSSWALK):
            with open(_SOC_CROSSWALK, "r", encoding="utf-8") as f:
                self.soc_crosswalk = json.load(f)
            logger.info(f"SOC crosswalk: {len(self.soc_crosswalk)} mappings")

    # ------------------------------------------------------------------
    # 2. Build vocabulary
    # ------------------------------------------------------------------
    def _extract_hot_tech_skills(self) -> set:
        """Extract hot / in-demand technology names from Technology Skills.xlsx."""
        skills = set()
        if self.tech_skills_df is None:
            return skills

        hot_mask = (
            (self.tech_skills_df["Hot Technology"].astype(str).str.upper() == "Y") |
            (self.tech_skills_df.get("In Demand", pd.Series(dtype=str)).astype(str).str.upper() == "Y")
        )
        hot_df = self.tech_skills_df[hot_mask]

        # Use Commodity Title (category) as canonical skill name for grouping,
        # but also keep individual Example names for popular technologies
        for _, row in hot_df.iterrows():
            example_name = str(row.get("Example", "")).strip().lower()
            commodity = str(row.get("Commodity Title", "")).strip().lower()
            if example_name and example_name != "nan":
                skills.add(example_name)
            if commodity and commodity != "nan":
                skills.add(commodity)

        return skills

    def _extract_core_skills(self, min_importance: float = 3.5) -> set:
        """Extract important core skills from Skills.xlsx (Importance scale)."""
        skills = set()
        if self.skills_df is None:
            return skills

        important = self.skills_df[
            (self.skills_df["Scale Name"] == "Importance") &
            (self.skills_df["Data Value"] >= min_importance)
        ]
        for name in important["Element Name"].dropna().unique():
            skills.add(str(name).strip().lower())
        return skills

    def _extract_knowledge_areas(self, min_importance: float = 3.5) -> set:
        """Extract important knowledge areas from Knowledge.xlsx."""
        skills = set()
        if self.knowledge_df is None:
            return skills

        important = self.knowledge_df[
            (self.knowledge_df["Scale Name"] == "Importance") &
            (self.knowledge_df["Data Value"] >= min_importance)
        ]
        for name in important["Element Name"].dropna().unique():
            skills.add(str(name).strip().lower())
        return skills

    def _extract_onet_json_skills(self) -> set:
        """Extract skill names from onet_occupations_data.json."""
        skills = set()
        for occ in self.onet_json:
            for s in occ.get("required", []):
                skills.add(str(s).strip().lower())
            for s in occ.get("optional", []):
                skills.add(str(s).strip().lower())
        return skills

    def _extract_csv_skills(self) -> set:
        """Extract unique skill names from the ai_job_dataset CSV."""
        skills = set()
        if self.job_csv_df is None:
            return skills

        for raw in self.job_csv_df["required_skills"].dropna():
            for s in str(raw).split(","):
                s = s.strip().lower()
                if s:
                    skills.add(s)
        return skills

    def _extract_api_tech_skills(self) -> set:
        """Extract tech skill names from O*NET API cache.

        Includes:
        - ALL hot_technology or in_demand skills
        - Non-hot skills that appear in >= _MIN_TECH_FREQUENCY occupations
        """
        skills = set()
        if not self.api_occupation_details:
            return skills

        # Count how many occupations each tech skill appears in
        tech_occ_counter: Counter = Counter()
        hot_or_demand: Set[str] = set()

        for _code, detail in self.api_occupation_details.items():
            seen_in_occ: Set[str] = set()
            for t in detail.get("tech_skills", []):
                name = t["name"].strip().lower()
                if not name:
                    continue
                if name not in seen_in_occ:
                    seen_in_occ.add(name)
                    tech_occ_counter[name] += 1
                if t.get("hot") or t.get("in_demand"):
                    hot_or_demand.add(name)

        # Include hot/in-demand unconditionally
        skills.update(hot_or_demand)

        # Include non-hot if they appear in enough occupations
        for name, count in tech_occ_counter.items():
            if count >= _MIN_TECH_FREQUENCY:
                skills.add(name)

        logger.info(
            f"API tech skills: {len(hot_or_demand)} hot/in-demand, "
            f"{len(skills) - len(hot_or_demand)} frequent (>={_MIN_TECH_FREQUENCY} occs), "
            f"total {len(skills)}"
        )
        return skills

    def _extract_api_core_skills(self) -> set:
        """Extract core skill names from O*NET API cache."""
        skills = set()
        for _code, detail in self.api_occupation_details.items():
            for s in detail.get("skills", []):
                name = s.get("name", "").strip().lower()
                if name:
                    skills.add(name)
        return skills

    def _extract_api_knowledge(self) -> set:
        """Extract knowledge area names from O*NET API cache."""
        knowledge = set()
        for _code, detail in self.api_occupation_details.items():
            for k in detail.get("knowledge", []):
                name = k.get("name", "").strip().lower()
                if name:
                    knowledge.add(name)
        return knowledge

    def build_vocabulary(self) -> Dict[str, int]:
        """Merge skill names from all sources into a deduplicated vocabulary."""
        logger.info("Building unified skill vocabulary...")

        hot_tech   = self._extract_hot_tech_skills()
        core       = self._extract_core_skills()
        knowledge  = self._extract_knowledge_areas()
        onet_json  = self._extract_onet_json_skills()
        csv_skills = self._extract_csv_skills()

        # API enrichment sources
        api_tech   = self._extract_api_tech_skills()
        api_core   = self._extract_api_core_skills()
        api_know   = self._extract_api_knowledge()

        # Merge all — lowercase, stripped
        all_skills = set()
        for source in [hot_tech, core, knowledge, onet_json, csv_skills,
                       api_tech, api_core, api_know]:
            all_skills.update(source)

        # Remove very short or noisy entries
        all_skills = {s for s in all_skills if len(s) >= 2 and s != "nan"}

        # Sort for reproducibility and assign indices
        sorted_skills = sorted(all_skills)
        self.skill_vocab = {skill: idx for idx, skill in enumerate(sorted_skills)}

        logger.info(
            f"Vocabulary size: {len(self.skill_vocab)}  "
            f"(hot_tech={len(hot_tech)}, core={len(core)}, "
            f"knowledge={len(knowledge)}, onet_json={len(onet_json)}, "
            f"csv={len(csv_skills)}, "
            f"api_tech={len(api_tech)}, api_core={len(api_core)}, "
            f"api_knowledge={len(api_know)})"
        )
        return self.skill_vocab

    # ------------------------------------------------------------------
    # 3. Build binary vectors
    # ------------------------------------------------------------------
    def _skill_to_index(self, skill_name: str) -> int:
        """Look up a skill in the vocab; return -1 if absent."""
        return self.skill_vocab.get(skill_name.strip().lower(), -1)

    def _build_onet_vectors(self) -> Tuple[np.ndarray, List[str]]:
        """Build vectors from Technology Skills.xlsx + O*NET JSON, aggregated per occupation."""
        V = len(self.skill_vocab)
        occ_skills: Dict[str, set] = {}

        # From Technology Skills.xlsx (hot / in-demand only)
        if self.tech_skills_df is not None:
            hot_mask = (
                (self.tech_skills_df["Hot Technology"].astype(str).str.upper() == "Y") |
                (self.tech_skills_df.get("In Demand", pd.Series(dtype=str)).astype(str).str.upper() == "Y")
            )
            for _, row in self.tech_skills_df[hot_mask].iterrows():
                occ = str(row.get("O*NET-SOC Code", "")).strip()
                if not occ:
                    continue
                occ_skills.setdefault(occ, set())
                example = str(row.get("Example", "")).strip().lower()
                commodity = str(row.get("Commodity Title", "")).strip().lower()
                if example in self.skill_vocab:
                    occ_skills[occ].add(example)
                if commodity in self.skill_vocab:
                    occ_skills[occ].add(commodity)

        # From Skills.xlsx (importance >= 3.5)
        if self.skills_df is not None:
            important = self.skills_df[
                (self.skills_df["Scale Name"] == "Importance") &
                (self.skills_df["Data Value"] >= 3.5)
            ]
            for _, row in important.iterrows():
                occ = str(row.get("O*NET-SOC Code", "")).strip()
                skill = str(row.get("Element Name", "")).strip().lower()
                if occ and skill in self.skill_vocab:
                    occ_skills.setdefault(occ, set()).add(skill)

        # From Knowledge.xlsx (importance >= 3.5)
        if self.knowledge_df is not None:
            important = self.knowledge_df[
                (self.knowledge_df["Scale Name"] == "Importance") &
                (self.knowledge_df["Data Value"] >= 3.5)
            ]
            for _, row in important.iterrows():
                occ = str(row.get("O*NET-SOC Code", "")).strip()
                skill = str(row.get("Element Name", "")).strip().lower()
                if occ and skill in self.skill_vocab:
                    occ_skills.setdefault(occ, set()).add(skill)

        # From O*NET JSON
        for entry in self.onet_json:
            occ = entry.get("occupation_code", "")
            if not occ:
                continue
            occ_skills.setdefault(occ, set())
            for s in entry.get("required", []):
                s_lower = s.strip().lower()
                if s_lower in self.skill_vocab:
                    occ_skills[occ].add(s_lower)
            for s in entry.get("optional", []):
                s_lower = s.strip().lower()
                if s_lower in self.skill_vocab:
                    occ_skills[occ].add(s_lower)

        # Convert to matrix
        labels = sorted(occ_skills.keys())
        matrix = np.zeros((len(labels), V), dtype=np.float32)
        for i, occ in enumerate(labels):
            for skill in occ_skills[occ]:
                idx = self.skill_vocab[skill]
                matrix[i, idx] = 1.0

        return matrix, labels

    def _build_csv_vectors(self) -> Tuple[np.ndarray, List[str]]:
        """Build vectors from the AI job dataset CSV, one row per job posting."""
        V = len(self.skill_vocab)
        if self.job_csv_df is None:
            return np.empty((0, V), dtype=np.float32), []

        labels = []
        rows = []
        for _, row in self.job_csv_df.iterrows():
            vec = np.zeros(V, dtype=np.float32)
            raw_skills = str(row.get("required_skills", ""))
            for s in raw_skills.split(","):
                s = s.strip().lower()
                if s in self.skill_vocab:
                    vec[self.skill_vocab[s]] = 1.0
            rows.append(vec)
            labels.append(str(row.get("job_id", f"csv_{len(labels)}")))

        matrix = np.stack(rows) if rows else np.empty((0, V), dtype=np.float32)
        return matrix, labels

    # ------------------------------------------------------------------
    # API-enriched vector builders
    # ------------------------------------------------------------------
    def _build_api_vectors(self) -> Tuple[np.ndarray, List[str]]:
        """Build vectors from O*NET API cached occupation details."""
        V = len(self.skill_vocab)
        if not self.api_occupation_details:
            return np.empty((0, V), dtype=np.float32), []

        labels = []
        rows = []
        for code in sorted(self.api_occupation_details.keys()):
            detail = self.api_occupation_details[code]
            vec = np.zeros(V, dtype=np.float32)

            # Technology skills
            for t in detail.get("tech_skills", []):
                name = t["name"].strip().lower()
                if name in self.skill_vocab:
                    vec[self.skill_vocab[name]] = 1.0
                # Also set the category name if it's in vocab
                cat = t.get("category", "").strip().lower()
                if cat and cat in self.skill_vocab:
                    vec[self.skill_vocab[cat]] = 1.0

            # Core skills
            for s in detail.get("skills", []):
                name = s.get("name", "").strip().lower()
                if name in self.skill_vocab:
                    vec[self.skill_vocab[name]] = 1.0

            # Knowledge
            for k in detail.get("knowledge", []):
                name = k.get("name", "").strip().lower()
                if name in self.skill_vocab:
                    vec[self.skill_vocab[name]] = 1.0

            if vec.sum() >= 1:  # at least 1 skill matched
                rows.append(vec)
                labels.append(code)

        matrix = np.stack(rows) if rows else np.empty((0, V), dtype=np.float32)
        logger.info(
            f"API vectors: {matrix.shape[0]} occupations, "
            f"avg {matrix.sum(axis=1).mean():.1f} skills/occupation"
        )
        return matrix, labels

    def _extract_skills_from_description(self, description: str) -> Set[str]:
        """Extract skill names from a job description using vocab matching."""
        desc_lower = description.lower()
        found: Set[str] = set()

        # Check aliases first
        for alias, canonical in _SKILL_ALIASES.items():
            if alias in desc_lower and canonical in self.skill_vocab:
                found.add(canonical)

        # Sort vocab by length descending (match longer terms first)
        sorted_vocab = sorted(self.skill_vocab.keys(), key=len, reverse=True)

        for skill in sorted_vocab:
            if len(skill) <= 2:
                continue  # skip very short (avoid false positives)
            if skill in found:
                continue  # already matched

            if len(skill) <= 5:
                # Use word boundary matching for short skills
                pattern = r"\b" + re.escape(skill) + r"\b"
                if re.search(pattern, desc_lower):
                    found.add(skill)
            else:
                # Substring matching is sufficient for longer skills
                if skill in desc_lower:
                    found.add(skill)

        return found

    def _build_jsearch_vectors(self) -> Tuple[np.ndarray, List[str]]:
        """Build vectors from JSearch job descriptions using keyword extraction."""
        V = len(self.skill_vocab)
        if not self.jsearch_jobs:
            return np.empty((0, V), dtype=np.float32), []

        labels = []
        rows = []
        extract_counts = []

        for job in self.jsearch_jobs:
            desc = job.get("job_description", "") or ""
            if len(desc) < 50:
                continue

            vec = np.zeros(V, dtype=np.float32)

            # 1. Extract skills from description
            extracted = self._extract_skills_from_description(desc)
            for skill in extracted:
                if skill in self.skill_vocab:
                    vec[self.skill_vocab[skill]] = 1.0

            # 2. If job has an O*NET SOC code, add baseline skills via crosswalk
            soc = str(job.get("job_onet_soc", "") or "")
            if soc and soc in self.soc_crosswalk:
                onet_code = self.soc_crosswalk[soc]
                if onet_code in self.api_occupation_details:
                    occ_detail = self.api_occupation_details[onet_code]
                    # Add hot/in-demand tech skills from the occupation
                    for t in occ_detail.get("tech_skills", []):
                        if t.get("hot") or t.get("in_demand"):
                            name = t["name"].strip().lower()
                            if name in self.skill_vocab:
                                vec[self.skill_vocab[name]] = 1.0

            skill_count = int(vec.sum())
            extract_counts.append(skill_count)

            if skill_count >= 3:  # minimum quality threshold
                rows.append(vec)
                labels.append(str(job.get("job_id", f"jsearch_{len(labels)}")))

        matrix = np.stack(rows) if rows else np.empty((0, V), dtype=np.float32)
        avg_extracted = sum(extract_counts) / max(len(extract_counts), 1)
        logger.info(
            f"JSearch vectors: {matrix.shape[0]}/{len(self.jsearch_jobs)} jobs kept "
            f"(avg {avg_extracted:.1f} skills/job, min threshold=3)"
        )
        return matrix, labels

    def build_vectors(self) -> Tuple[np.ndarray, List[str]]:
        """Build combined binary vectors from O*NET, CSV, API, and JSearch sources."""
        logger.info("Building binary skill vectors...")

        onet_matrix, onet_labels = self._build_onet_vectors()
        csv_matrix, csv_labels = self._build_csv_vectors()
        api_matrix, api_labels = self._build_api_vectors()
        jsearch_matrix, jsearch_labels = self._build_jsearch_vectors()

        # Stack all non-empty sources vertically
        matrices = []
        all_labels = []
        for name, mat, lab in [
            ("O*NET Excel", onet_matrix, onet_labels),
            ("CSV", csv_matrix, csv_labels),
            ("O*NET API", api_matrix, api_labels),
            ("JSearch", jsearch_matrix, jsearch_labels),
        ]:
            if mat.size > 0:
                matrices.append(mat)
                all_labels.extend(lab)
                logger.info(f"  {name}: {mat.shape[0]} samples")

        if matrices:
            self.vectors = np.vstack(matrices)
            self.labels = all_labels
        else:
            V = len(self.skill_vocab)
            self.vectors = np.empty((0, V), dtype=np.float32)
            self.labels = []

        # Remove rows that are all-zero (no matched skills at all)
        nonzero_mask = self.vectors.sum(axis=1) > 0
        self.vectors = self.vectors[nonzero_mask]
        self.labels = [self.labels[i] for i, keep in enumerate(nonzero_mask) if keep]

        logger.info(
            f"Final dataset: {self.vectors.shape[0]} samples × {self.vectors.shape[1]} features  "
            f"(sparsity: {1 - self.vectors.mean():.4f})"
        )
        return self.vectors, self.labels

    # ------------------------------------------------------------------
    # 4. Save artefacts
    # ------------------------------------------------------------------
    def save(self, output_dir: str = None) -> str:
        """Persist processed data to disk."""
        out = output_dir or _OUTPUT_DIR
        os.makedirs(out, exist_ok=True)

        np.save(os.path.join(out, "skill_vectors.npy"), self.vectors)
        with open(os.path.join(out, "skill_index.json"), "w", encoding="utf-8") as f:
            json.dump(self.skill_vocab, f, indent=2)
        with open(os.path.join(out, "occupation_labels.json"), "w", encoding="utf-8") as f:
            json.dump(self.labels, f, indent=2)

        meta = {
            "vocab_size": len(self.skill_vocab),
            "num_samples": int(self.vectors.shape[0]),
            "sparsity": float(1 - self.vectors.mean()),
            "onet_json_occupations": len(self.onet_json),
            "csv_rows": len(self.job_csv_df) if self.job_csv_df is not None else 0,
            "api_occupations": len(self.api_occupation_details),
            "jsearch_jobs": len(self.jsearch_jobs),
            "soc_crosswalk_entries": len(self.soc_crosswalk),
        }
        with open(os.path.join(out, "vocab_metadata.json"), "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        logger.info(f"Saved processed data to {out}")
        return out

    # ------------------------------------------------------------------
    # Convenience: run the full pipeline
    # ------------------------------------------------------------------
    def run(self) -> str:
        """Execute the complete data processing pipeline."""
        self.load_data()
        self.build_vocabulary()
        self.build_vectors()
        return self.save()


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    processor = SkillDataProcessor()
    out_dir = processor.run()
    print(f"\nDone. Artefacts saved to: {out_dir}")
    print(f"  Vocabulary : {len(processor.skill_vocab)} skills")
    print(f"  Vectors    : {processor.vectors.shape}")
