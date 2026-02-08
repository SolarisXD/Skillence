"""Quick test script for JSearch API — inspect response structure."""
import os
import requests
import json
import sys
import io
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

headers = {
    "x-rapidapi-host": "jsearch.p.rapidapi.com",
    "x-rapidapi-key": os.getenv("JSEARCH_API_KEY", ""),
}

r = requests.get(
    "https://jsearch.p.rapidapi.com/search",
    params={
        "query": "software developer jobs in India",
        "page": "1",
        "num_pages": "1",
        "country": "in",
        "date_posted": "all",
    },
    headers=headers,
)

data = r.json()
job = data["data"][0]

print("=== All Job Keys ===")
for k, v in job.items():
    val = str(v)[:100] if v else "None"
    print(f"  {k}: {val}")

print("\n=== Job Highlights ===")
if job.get("job_highlights"):
    for section in job["job_highlights"]:
        title = section.get("title", "N/A")
        print(f"  Section: {title}")
        for item in section.get("items", [])[:3]:
            print(f"    - {item[:120]}")

print("\n=== Required Experience ===")
print(json.dumps(job.get("job_required_experience", {}), indent=2))

print("\n=== Required Skills ===")
print(job.get("job_required_skills"))

print("\n=== Required Education ===")
print(json.dumps(job.get("job_required_education", {}), indent=2))

print("\n=== Job ONET SOC Code ===")
print(job.get("job_onet_soc"))
print(job.get("job_onet_job_zone"))

# Check a few more jobs for skills
print("\n=== Skills across all 10 jobs ===")
for j in data["data"]:
    title = j.get("job_title", "?")
    skills = j.get("job_required_skills")
    onet = j.get("job_onet_soc")
    print(f"  {title}")
    print(f"    O*NET code: {onet}")
    print(f"    Skills: {skills}")
    print()
