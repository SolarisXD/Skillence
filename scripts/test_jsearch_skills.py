"""Test JSearch API with various queries to understand skill extraction."""
import os
import requests
import json
import sys
import io
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

headers = {
    "x-rapidapi-host": "jsearch.p.rapidapi.com",
    "x-rapidapi-key": os.getenv("JSEARCH_API_KEY", ""),
}

queries = [
    ("data scientist jobs in India", "in"),
    ("python developer in Bangalore", "in"),
    ("machine learning engineer USA", "us"),
    ("devops engineer in India", "in"),
]

for query_str, country in queries:
    r = requests.get(
        "https://jsearch.p.rapidapi.com/search",
        params={
            "query": query_str,
            "page": "1",
            "num_pages": "1",
            "country": country,
            "date_posted": "month",
        },
        headers=headers,
    )
    data = r.json()
    print(f"=== {query_str} ({country}) ===")
    print(f"  Results: {len(data.get('data', []))}")

    for j in data.get("data", [])[:3]:
        title = j.get("job_title", "?")
        skills = j.get("job_required_skills")
        onet = j.get("job_onet_soc")
        highlights = j.get("job_highlights")
        desc = (j.get("job_description") or "")[:200]

        print(f"  Job: {title}")
        print(f"    O*NET: {onet}")
        print(f"    Skills field: {skills}")

        if highlights:
            for sec in highlights:
                sec_title = sec.get("title", "")
                if "qualif" in sec_title.lower() or "req" in sec_title.lower():
                    print(f"    Highlights [{sec_title}]:")
                    for item in sec.get("items", [])[:5]:
                        print(f"      - {item[:120]}")

        print(f"    Desc preview: {desc}")
        print()

    print("---\n")
