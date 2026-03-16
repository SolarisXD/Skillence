import json
import os
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
from pymongo import MongoClient


def _stringify(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _stringify(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_stringify(v) for v in value]
    return value


def _safe_skills_from_profile(profile_doc: Dict[str, Any]) -> Dict[str, List[str]]:
    profile_data = (profile_doc or {}).get("profile_data", {})
    skills = profile_data.get("skills", {})

    if isinstance(skills, dict):
        technical = [s for s in skills.get("technical", []) if isinstance(s, str)]
        soft = [s for s in skills.get("soft", []) if isinstance(s, str)]
        languages = [s for s in skills.get("languages", []) if isinstance(s, str)]
        return {
            "technical": technical,
            "soft": soft,
            "languages": languages,
        }

    if isinstance(skills, list):
        return {"technical": [s for s in skills if isinstance(s, str)], "soft": [], "languages": []}

    return {"technical": [], "soft": [], "languages": []}


def _extract_drive_shape(drive: Dict[str, Any]) -> Dict[str, Any]:
    jd = drive.get("jd_structured") or {}
    required = jd.get("required_skills") or []
    preferred = jd.get("preferred_skills") or []

    required_skills = [item.get("skill") for item in required if isinstance(item, dict) and item.get("skill")]
    preferred_skills = [item.get("skill") for item in preferred if isinstance(item, dict) and item.get("skill")]

    jd_type = "none"
    if drive.get("jd_raw_text") and jd:
        jd_type = "text+structured"
    elif jd:
        jd_type = "structured_only"
    elif drive.get("jd_raw_text"):
        jd_type = "raw_text_only"

    return {
        "id": str(drive.get("_id")),
        "company_name": drive.get("company_name"),
        "role_title": drive.get("role_title"),
        "status": drive.get("status"),
        "created_by": drive.get("created_by"),
        "application_deadline": _stringify(drive.get("application_deadline")),
        "drive_date": _stringify(drive.get("drive_date")),
        "criteria": drive.get("criteria"),
        "package": drive.get("package"),
        "jd_type": jd_type,
        "required_skills_count": len(required_skills),
        "preferred_skills_count": len(preferred_skills),
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
    }


def main() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    root_dir = backend_dir.parent

    load_dotenv(root_dir / ".env")
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise RuntimeError("MONGODB_URI is not set in .env")

    client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True, retryWrites=True)
    db = client.skillence_db

    users_col = db.users
    profiles_col = db.profiles
    academics_col = db.student_academics
    drives_col = db.company_drives
    applications_col = db.applications
    course_catalog_col = db.course_catalog

    collection_counts = {
        "users": users_col.count_documents({}),
        "profiles": profiles_col.count_documents({}),
        "student_academics": academics_col.count_documents({}),
        "company_drives": drives_col.count_documents({}),
        "applications": applications_col.count_documents({}),
        "course_catalog": course_catalog_col.count_documents({}),
    }

    drives = [_extract_drive_shape(d) for d in drives_col.find({}).sort("created_at", -1)]

    profiles_by_user = {p.get("user_id"): p for p in profiles_col.find({})}
    academics_by_user = {a.get("user_id"): a for a in academics_col.find({})}

    users_with_profiles = []
    technical_counter: Counter = Counter()
    weighted_counter: Counter = Counter()

    for user in users_col.find({}, {"email": 1, "name": 1, "role": 1, "created_at": 1}):
        user_id = str(user.get("_id"))
        role = user.get("role", "student")
        profile_doc = profiles_by_user.get(user_id)
        academics_doc = academics_by_user.get(user_id)

        profile_skills = _safe_skills_from_profile(profile_doc or {})
        for skill in profile_skills["technical"]:
            technical_counter[skill.lower()] += 1

        weighted_skills = academics_doc.get("skill_profile", {}) if academics_doc else {}
        if isinstance(weighted_skills, dict):
            for skill in weighted_skills.keys():
                weighted_counter[str(skill).lower()] += 1

        if profile_doc or academics_doc:
            users_with_profiles.append({
                "user_id": user_id,
                "name": user.get("name"),
                "email": user.get("email"),
                "role": role,
                "created_at": _stringify(user.get("created_at")),
                "profile_skills": profile_skills,
                "career_objective": (profile_doc or {}).get("profile_data", {}).get("career_objective"),
                "academics": {
                    "cgpa": (academics_doc or {}).get("cgpa"),
                    "tenth_percentage": (academics_doc or {}).get("tenth_percentage"),
                    "twelfth_percentage": (academics_doc or {}).get("twelfth_percentage"),
                    "student_info": (academics_doc or {}).get("student_info"),
                    "weighted_skill_count": len((academics_doc or {}).get("skill_profile", {}) or {}),
                    "resume_skill_count": len((academics_doc or {}).get("resume_skills", []) or []),
                    "course_count": len((academics_doc or {}).get("all_courses", []) or []),
                },
            })

    applications = []
    for app in applications_col.find({}).sort("applied_at", -1):
        applications.append({
            "id": str(app.get("_id")),
            "drive_id": app.get("drive_id"),
            "user_id": app.get("user_id"),
            "status": app.get("status"),
            "match_score": app.get("match_score"),
            "applied_at": _stringify(app.get("applied_at")),
        })

    placement_users = []
    for user in users_col.find({"role": "placement_cell"}, {"email": 1, "name": 1}):
        placement_users.append({
            "user_id": str(user.get("_id")),
            "name": user.get("name"),
            "email": user.get("email"),
        })

    result = {
        "generated_at": datetime.utcnow().isoformat(),
        "db_name": "skillence_db",
        "collection_counts": collection_counts,
        "placement_users": placement_users,
        "drives": drives,
        "applications": applications,
        "users_with_profiles_or_academics": users_with_profiles,
        "skill_frequency": {
            "profile_technical_top_100": technical_counter.most_common(100),
            "academics_weighted_top_100": weighted_counter.most_common(100),
        },
    }

    output_dir = backend_dir / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"placement_dataset_snapshot_{ts}.json"

    with output_file.open("w", encoding="utf-8") as f:
        json.dump(_stringify(result), f, indent=2, ensure_ascii=False)

    print(f"Snapshot saved: {output_file}")
    print(f"Counts: {collection_counts}")
    print(f"Drives exported: {len(drives)} | Users exported: {len(users_with_profiles)} | Applications exported: {len(applications)}")

    client.close()


if __name__ == "__main__":
    main()
