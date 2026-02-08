"""Verify JSearch SOC code to O*NET code mapping."""
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

# JSearch returns codes like 15113200 — let's parse them
jsearch_codes = ["15113200", "15113300", "25102100", "15111100"]

for code in jsearch_codes:
    formatted = code[0:2] + "-" + code[2:6] + "." + code[6:8]
    r = requests.get(f"{BASE}/online/occupations/{formatted}/", headers=headers)
    if r.status_code == 200:
        title = r.json().get("title", "?")
        print(f"JSearch {code} -> O*NET {formatted}: {title}")
    else:
        print(f"JSearch {code} -> O*NET {formatted}: NOT FOUND (HTTP {r.status_code})")
        # Try with different formatting or search
        plain = code[0:2] + "-" + code[2:6]
        r2 = requests.get(f"{BASE}/online/search", params={"keyword": plain}, headers=headers)
        if r2.status_code == 200:
            results = r2.json().get("occupation", [])[:3]
            print(f"  Search results for '{plain}':")
            for occ in results:
                print(f"    {occ['code']}: {occ['title']}")

# Also check: does O*NET API have a crosswalk?
print("\n--- O*NET 2019 SOC codes for software-related ---")
r = requests.get(f"{BASE}/online/search", params={"keyword": "software", "start": 1, "end": 10}, headers=headers)
for occ in r.json().get("occupation", [])[:10]:
    print(f"  {occ['code']}: {occ['title']}")
