"""Test O*NET API — explore full occupation tech skills for a few jobs."""
import os
import requests
import json
import sys
import io
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

headers = {"X-API-Key": os.getenv("ONET_API_KEY", ""), "Accept": "application/json"}
BASE = "https://api-v2.onetcenter.org"


def get_all_tech_skills(occ_code):
    """Fetch ALL technology skill examples for an occupation (paginated)."""
    all_skills = []
    start = 1
    while True:
        r = requests.get(
            f"{BASE}/online/occupations/{occ_code}/summary/technology_skills",
            params={"start": start, "end": start + 19},
            headers=headers,
        )
        if r.status_code != 200:
            break
        data = r.json()
        for cat in data.get("category", []):
            cat_title = cat.get("title", "")
            for ex in cat.get("example", []):
                all_skills.append({
                    "name": ex.get("title", ""),
                    "category": cat_title,
                    "hot": ex.get("hot_technology", False),
                    "in_demand": ex.get("in_demand", False),
                })
            for ex in cat.get("example_more", []):
                all_skills.append({
                    "name": ex.get("title", ""),
                    "category": cat_title,
                    "hot": False,
                    "in_demand": False,
                })
        total = data.get("total", 0)
        end = data.get("end", 0)
        if end >= total:
            break
        start = end + 1
    return all_skills


def get_all_skills(occ_code):
    """Fetch ALL core skills for an occupation (paginated)."""
    all_skills = []
    start = 1
    while True:
        r = requests.get(
            f"{BASE}/online/occupations/{occ_code}/summary/skills",
            params={"start": start, "end": start + 19},
            headers=headers,
        )
        if r.status_code != 200:
            break
        data = r.json()
        for el in data.get("element", []):
            all_skills.append(el.get("name", ""))
        total = data.get("total", 0)
        end = data.get("end", 0)
        if end >= total:
            break
        start = end + 1
    return all_skills


def get_all_knowledge(occ_code):
    """Fetch ALL knowledge areas for an occupation (paginated)."""
    all_knowledge = []
    start = 1
    while True:
        r = requests.get(
            f"{BASE}/online/occupations/{occ_code}/summary/knowledge",
            params={"start": start, "end": start + 19},
            headers=headers,
        )
        if r.status_code != 200:
            break
        data = r.json()
        for el in data.get("element", []):
            all_knowledge.append(el.get("name", ""))
        total = data.get("total", 0)
        end = data.get("end", 0)
        if end >= total:
            break
        start = end + 1
    return all_knowledge


# Test with a few occupations
test_occupations = [
    "15-1252.00",  # Software Developers
    "15-2051.00",  # Data Scientists
    "15-1244.00",  # Network & Computer Systems Administrators
]

for occ in test_occupations:
    print(f"\n{'='*60}")
    # Get title
    r = requests.get(f"{BASE}/online/occupations/{occ}/", headers=headers)
    title = r.json().get("title", occ) if r.status_code == 200 else occ

    tech = get_all_tech_skills(occ)
    skills = get_all_skills(occ)
    knowledge = get_all_knowledge(occ)

    print(f"Occupation: {title} ({occ})")
    print(f"  Core Skills ({len(skills)}): {skills[:8]}...")
    print(f"  Knowledge ({len(knowledge)}): {knowledge[:8]}...")
    print(f"  Tech Skills ({len(tech)}):")
    hot_tech = [t for t in tech if t["hot"]]
    print(f"    Hot Technologies: {len(hot_tech)}")
    for t in hot_tech[:10]:
        print(f"      - {t['name']} [{t['category']}]")
    print(f"    All tech (first 10):")
    for t in tech[:10]:
        status = "HOT" if t["hot"] else ("IN-DEMAND" if t["in_demand"] else "")
        print(f"      - {t['name']} [{t['category']}] {status}")

# Check rate limits
print("\n\nAPI rate limit info: check response headers")
r = requests.get(f"{BASE}/about/", headers=headers)
print("Rate-limit headers:", {k: v for k, v in r.headers.items() if "rate" in k.lower() or "limit" in k.lower()})
