import json
import os
import random
import string
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Tuple

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection

import sys

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

from app.utils.security import get_password_hash
from app.services.matching_engine import score_student_for_drive


GRADE_POINTS = {
    "S": 10.0,
    "A": 9.0,
    "B": 8.0,
    "C": 7.0,
    "D": 6.0,
    "E": 5.0,
    "F": 0.0,
}

TRACKS = {
    "ai_ml": {
        "career_aim": "AI/ML Engineer focused on applied ML systems and model deployment.",
        "technical": [
            "python", "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
            "numpy", "pandas", "sql", "data visualization", "scikit-learn", "fastapi",
        ],
        "preferred": ["docker", "aws", "git", "statistics", "data preprocessing"],
        "course_keywords": ["machine", "deep", "neural", "data", "python", "ai", "nlp"],
    },
    "backend": {
        "career_aim": "Backend Engineer building scalable APIs and distributed services.",
        "technical": [
            "java", "python", "sql", "database management systems", "data structures",
            "algorithms", "object-oriented programming", "rest api", "microservices", "redis",
        ],
        "preferred": ["docker", "kubernetes", "aws", "git", "linux", "system design"],
        "course_keywords": ["database", "operating", "algorithm", "object", "java", "compiler"],
    },
    "frontend": {
        "career_aim": "Frontend Engineer focused on high-quality React web experiences.",
        "technical": [
            "javascript", "typescript", "react", "html", "css", "redux", "rest api",
            "web development", "ui/ux", "testing",
        ],
        "preferred": ["node.js", "next.js", "git", "figma", "performance optimization"],
        "course_keywords": ["web", "javascript", "ui", "frontend", "software"],
    },
    "devops": {
        "career_aim": "DevOps/Cloud Engineer automating CI/CD and resilient deployments.",
        "technical": [
            "linux", "docker", "kubernetes", "ci/cd", "aws", "azure", "gcp", "terraform",
            "python", "bash", "monitoring", "networking",
        ],
        "preferred": ["ansible", "git", "prometheus", "security", "system design"],
        "course_keywords": ["cloud", "network", "operating", "devops", "system"],
    },
    "data_analytics": {
        "career_aim": "Data Analyst / BI Engineer delivering insights from enterprise datasets.",
        "technical": [
            "sql", "python", "pandas", "statistics", "excel", "power bi", "tableau",
            "data mining", "data warehousing", "etl", "data visualization",
        ],
        "preferred": ["machine learning", "communication", "business analysis", "git"],
        "course_keywords": ["data", "statistics", "warehouse", "mining", "analytics"],
    },
    "cybersecurity": {
        "career_aim": "Cybersecurity Analyst focused on secure systems and threat mitigation.",
        "technical": [
            "network security", "cryptography", "linux", "python", "ethical hacking",
            "owasp", "siem", "incident response", "forensics", "firewalls",
        ],
        "preferred": ["compliance", "docker", "cloud security", "tcp/ip", "risk assessment"],
        "course_keywords": ["security", "network", "crypt", "operating", "forensics"],
    },
}

DUMMY_STUDENTS = [
    ("Aarav Menon", "ai_ml"),
    ("Isha Verma", "frontend"),
    ("Kabir Arora", "backend"),
    ("Meera Nair", "data_analytics"),
    ("Rohan Bhat", "devops"),
    ("Ananya Iyer", "ai_ml"),
    ("Siddharth Jain", "cybersecurity"),
    ("Priya Kulkarni", "backend"),
    ("Dev Sharma", "data_analytics"),
    ("Nisha Rao", "frontend"),
]

DRIVE_BLUEPRINTS = [
    {
        "company_name": "Vertex Systems",
        "role_title": "Backend Developer",
        "track": "backend",
        "criteria": {"min_tenth_percentage": 70, "min_twelfth_percentage": 70, "min_ug_cgpa": 7.0, "min_cgpa": 7.0, "max_shortlist_count": 120},
        "package": {"ctc": "9.5 LPA", "base_salary": "7.8 LPA", "location": "Bangalore", "role_type": "Full-time"},
    },
    {
        "company_name": "Nimbus AI Labs",
        "role_title": "ML Engineer",
        "track": "ai_ml",
        "criteria": {"min_tenth_percentage": 75, "min_twelfth_percentage": 70, "min_ug_cgpa": 7.5, "min_cgpa": 7.5, "max_shortlist_count": 80},
        "package": {"ctc": "12.0 LPA", "base_salary": "10.0 LPA", "location": "Hyderabad", "role_type": "Full-time"},
    },
    {
        "company_name": "PixelForge Tech",
        "role_title": "Frontend Developer",
        "track": "frontend",
        "criteria": {"min_tenth_percentage": 65, "min_twelfth_percentage": 65, "min_ug_cgpa": 6.8, "min_cgpa": 6.8, "max_shortlist_count": 100},
        "package": {"ctc": "8.2 LPA", "base_salary": "6.7 LPA", "location": "Pune", "role_type": "Full-time"},
    },
    {
        "company_name": "CloudRail Ops",
        "role_title": "DevOps Engineer",
        "track": "devops",
        "criteria": {"min_tenth_percentage": 70, "min_twelfth_percentage": 70, "min_ug_cgpa": 7.2, "min_cgpa": 7.2, "max_shortlist_count": 90},
        "package": {"ctc": "10.5 LPA", "base_salary": "8.9 LPA", "location": "Chennai", "role_type": "Full-time"},
    },
    {
        "company_name": "Sentinel Secure",
        "role_title": "Cybersecurity Analyst",
        "track": "cybersecurity",
        "criteria": {"min_tenth_percentage": 68, "min_twelfth_percentage": 68, "min_ug_cgpa": 7.0, "min_cgpa": 7.0, "max_shortlist_count": 70},
        "package": {"ctc": "9.0 LPA", "base_salary": "7.4 LPA", "location": "Noida", "role_type": "Full-time"},
    },
]

SEED_BATCH = "dummy_placement_seed_20260314"


def _normalize_skill(skill: str) -> str:
    return " ".join(skill.strip().lower().split())


def _collect_skill_pool(db) -> List[str]:
    skills = set()

    for doc in db.company_drives.find({}, {"jd_structured": 1}):
        jd = doc.get("jd_structured") or {}
        for item in jd.get("required_skills", []) + jd.get("preferred_skills", []):
            if isinstance(item, dict) and item.get("skill"):
                skills.add(_normalize_skill(item["skill"]))

    for doc in db.profiles.find({}, {"profile_data.skills": 1}):
        sk = ((doc.get("profile_data") or {}).get("skills") or {})
        if isinstance(sk, dict):
            for values in sk.values():
                if isinstance(values, list):
                    for s in values:
                        if isinstance(s, str) and s.strip():
                            skills.add(_normalize_skill(s))
        elif isinstance(sk, list):
            for s in sk:
                if isinstance(s, str) and s.strip():
                    skills.add(_normalize_skill(s))

    for doc in db.student_academics.find({}, {"skill_profile": 1, "resume_skills": 1}):
        for s in (doc.get("skill_profile") or {}).keys():
            skills.add(_normalize_skill(str(s)))
        for s in (doc.get("resume_skills") or []):
            if isinstance(s, str) and s.strip():
                skills.add(_normalize_skill(s))

    for doc in db.course_catalog.find({}, {"mapped_skills": 1, "skills": 1}):
        for s in (doc.get("mapped_skills") or []):
            if isinstance(s, str) and s.strip():
                skills.add(_normalize_skill(s))
        for s in (doc.get("skills") or []):
            if isinstance(s, str) and s.strip():
                skills.add(_normalize_skill(s))

    return sorted(skills)


def _choose_from_pool(pool: List[str], requested: List[str]) -> List[str]:
    pool_set = set(pool)
    final = []
    for skill in requested:
        ns = _normalize_skill(skill)
        if ns in pool_set:
            final.append(ns)
        else:
            final.append(ns)
    dedup = []
    seen = set()
    for skill in final:
        if skill not in seen:
            seen.add(skill)
            dedup.append(skill)
    return dedup


def _random_phone(rng: random.Random) -> str:
    return "+91 " + "".join(rng.choice(string.digits) for _ in range(10))


def _grade_for_strength(rng: random.Random, strong: bool) -> str:
    if strong:
        return rng.choices(["S", "A", "B"], weights=[0.35, 0.45, 0.20], k=1)[0]
    return rng.choices(["A", "B", "C", "D"], weights=[0.25, 0.40, 0.25, 0.10], k=1)[0]


def _course_to_semester(index: int) -> int:
    return min((index // 4) + 1, 8)


def _build_academic_courses(
    rng: random.Random,
    course_docs: List[Dict[str, Any]],
    track_keywords: List[str],
) -> Tuple[List[Dict[str, Any]], Dict[str, float]]:
    targeted = []
    generic = []

    for c in course_docs:
        name = (c.get("course_name") or "").lower()
        code = (c.get("course_code") or "")
        skills = c.get("mapped_skills") or c.get("skills") or []
        if not code or not name:
            continue
        row = {
            "course_code": code,
            "course_name": c.get("course_name"),
            "credits": float(c.get("credits") or 3.0),
            "distribution": c.get("category"),
            "category": c.get("category"),
            "skills": [
                _normalize_skill(s) for s in skills if isinstance(s, str) and s.strip()
            ],
        }

        if any(k in name for k in track_keywords):
            targeted.append(row)
        else:
            generic.append(row)

    rng.shuffle(targeted)
    rng.shuffle(generic)

    picked = targeted[:10] + generic[:12]
    if len(picked) < 16:
        picked += generic[12:20]

    picked = picked[:20]

    all_courses = []
    skill_acc = defaultdict(list)

    for idx, c in enumerate(picked):
        strong = idx < 10
        grade = _grade_for_strength(rng, strong)
        grade_points = GRADE_POINTS[grade]
        semester = _course_to_semester(idx)

        course_entry = {
            "course_code": c["course_code"],
            "course_name": c["course_name"],
            "course_type": rng.choice(["LT", "LTP", "LP"]),
            "credits": c["credits"],
            "grade": grade,
            "exam_month": rng.choice(["Jan-2024", "May-2024", "Nov-2024", "Mar-2025", "Nov-2025"]),
            "distribution": c.get("distribution") or "PC",
            "category": c.get("category") or "PC",
            "semester": semester,
        }
        all_courses.append(course_entry)

        for skill in c["skills"]:
            skill_acc[skill].append(grade_points)

    skill_profile = {}
    for skill, points in skill_acc.items():
        if points:
            skill_profile[skill] = round(sum(points) / len(points), 2)

    return all_courses, skill_profile


def _build_profile(name: str, email: str, phone: str, track: str, base_skills: Dict[str, List[str]], rng: random.Random) -> Dict[str, Any]:
    track_data = TRACKS[track]
    technical = _choose_from_pool(base_skills["pool"], track_data["technical"] + track_data["preferred"][:3])
    soft = ["communication", "teamwork", "problem solving"]
    langs = ["english", "hindi"]

    return {
        "contact_info": {
            "name": name,
            "email": email,
            "phone": phone,
            "location": rng.choice(["Bangalore", "Hyderabad", "Chennai", "Pune", "Noida"]),
            "linkedin": f"linkedin.com/in/{name.lower().replace(' ', '-')}",
            "website": "",
        },
        "career_objective": track_data["career_aim"],
        "skills": {
            "technical": [s.title() if len(s) > 3 else s.upper() for s in technical[:16]],
            "soft": [s.title() for s in soft],
            "languages": [s.title() for s in langs],
        },
        "education": [
            {
                "degree": "B.Tech in Computer Science",
                "institution": "VIT",
                "year": "2022-2026",
                "gpa": "",
                "location": "Vellore",
                "details": "Relevant coursework aligned to target role",
            }
        ],
        "experience": [
            {
                "title": "Intern",
                "company": rng.choice(["CodeSprint Labs", "DataVista", "CloudCore", "InfiniTech"]),
                "duration": "May 2025 - Jul 2025",
                "location": "Remote",
                "responsibilities": [
                    "Built feature modules and fixed production issues",
                    "Collaborated with team on sprint deliverables",
                ],
            }
        ],
        "projects": [
            {
                "name": f"{track.replace('_', ' ').title()} Capstone",
                "description": "Built an end-to-end project aligned to career objective.",
                "technologies": [s.title() if len(s) > 3 else s.upper() for s in technical[:5]],
                "link": "",
                "duration": "4 months",
                "role": "Developer",
            }
        ],
        "certifications": [
            {
                "name": rng.choice(["AWS Cloud Practitioner", "Google Data Analytics", "Azure Fundamentals", "Meta Front-End"]),
                "issuer": "Coursera",
                "date": "2025",
                "id": "",
                "link": "",
                "expiry": "",
            }
        ],
        "achievements": [
            {
                "title": "Hackathon Finalist",
                "description": "Reached top 10 in campus hackathon.",
                "date": "2025",
                "organization": "VIT",
            }
        ],
    }


def _build_drive_jd(track: str, skill_pool: List[str]) -> Tuple[Dict[str, Any], str]:
    track_data = TRACKS[track]
    required = _choose_from_pool(skill_pool, track_data["technical"][:8] + track_data["preferred"][:2])
    preferred = _choose_from_pool(skill_pool, track_data["preferred"] + track_data["technical"][8:12])

    jd_structured = {
        "job_title": track.replace("_", " ").title(),
        "required_skills": [{"skill": s, "weight": 0.7} for s in required[:10]],
        "preferred_skills": [{"skill": s, "weight": 0.3} for s in preferred[:8]],
        "min_experience_years": 0,
        "education_level": "Bachelor's degree",
        "domain": track.replace("_", "-"),
    }

    jd_text = (
        f"Role: {jd_structured['job_title']}\n"
        f"Required: {', '.join(s for s in required[:10])}\n"
        f"Preferred: {', '.join(s for s in preferred[:8])}\n"
        "Responsibilities: Build production-grade systems, collaborate with cross-functional teams, and deliver high quality software."
    )

    return jd_structured, jd_text


def _upsert_user(users_col: Collection, name: str, email: str, password: str) -> str:
    now = datetime.utcnow()
    user_doc = {
        "email": email,
        "name": name,
        "password": get_password_hash(password),
        "role": "student",
        "is_verified": True,
        "created_at": now,
        "is_dummy": True,
        "seed_batch": SEED_BATCH,
    }
    result = users_col.update_one({"email": email}, {"$set": user_doc}, upsert=True)
    if result.upserted_id:
        return str(result.upserted_id)
    existing = users_col.find_one({"email": email}, {"_id": 1})
    return str(existing["_id"])


def main() -> None:
    root_dir = BACKEND_DIR.parent
    load_dotenv(root_dir / ".env")

    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise RuntimeError("MONGODB_URI is not set in .env")

    rng = random.Random(20260314)

    client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True, retryWrites=True)
    db = client.skillence_db

    users_col = db.users
    profiles_col = db.profiles
    academics_col = db.student_academics
    drives_col = db.company_drives
    applications_col = db.applications
    course_catalog_col = db.course_catalog

    skill_pool = _collect_skill_pool(db)

    course_docs = list(
        course_catalog_col.find({}, {"course_code": 1, "course_name": 1, "credits": 1, "category": 1, "mapped_skills": 1, "skills": 1})
    )

    if not course_docs:
        raise RuntimeError("No courses found in course_catalog. Seed course catalog first.")

    placement_creator = users_col.find_one({"role": "placement_cell"}, {"_id": 1})
    if placement_creator:
        created_by = str(placement_creator["_id"])
    else:
        existing_drive = drives_col.find_one({}, {"created_by": 1})
        created_by = (existing_drive or {}).get("created_by")
    if not created_by:
        raise RuntimeError("Could not find placement creator user. Ensure at least one placement_cell user exists.")

    student_summary = []

    for idx, (name, track) in enumerate(DUMMY_STUDENTS, start=1):
        email = f"dummy.student{idx:02d}@skillence.test"
        password = f"Dummy@Stu{idx:02d}!"
        user_id = _upsert_user(users_col, name, email, password)

        phone = _random_phone(rng)
        profile_data = _build_profile(name, email, phone, track, {"pool": skill_pool}, rng)

        profiles_col.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "user_id": user_id,
                    "profile_data": profile_data,
                    "updated_at": datetime.utcnow(),
                    "version": "1.0",
                    "is_dummy": True,
                    "seed_batch": SEED_BATCH,
                },
                "$setOnInsert": {"created_at": datetime.utcnow()},
            },
            upsert=True,
        )

        all_courses, skill_profile = _build_academic_courses(rng, course_docs, TRACKS[track]["course_keywords"])

        cgpa = round(rng.uniform(6.8, 9.4), 2)
        tenth = round(rng.uniform(68, 95), 2)
        twelfth = round(rng.uniform(67, 94), 2)

        technical_skills = [
            _normalize_skill(s)
            for s in (profile_data.get("skills", {}).get("technical", []) or [])
            if isinstance(s, str)
        ]

        semesters = []
        by_sem = defaultdict(list)
        for c in all_courses:
            sem = c.get("semester", 1)
            by_sem[sem].append(c)
        for sem, courses in sorted(by_sem.items()):
            semesters.append({"semester": sem, "courses": courses})

        academics_col.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "user_id": user_id,
                    "student_info": {
                        "name": name,
                        "register_number": f"22BAI1{idx:04d}",
                        "program": "B.Tech CSE",
                        "campus": "VIT Vellore",
                    },
                    "tenth_percentage": tenth,
                    "twelfth_percentage": twelfth,
                    "cgpa": cgpa,
                    "all_courses": all_courses,
                    "semesters": semesters,
                    "skill_profile": skill_profile,
                    "resume_skills": technical_skills,
                    "updated_at": datetime.utcnow(),
                    "is_dummy": True,
                    "seed_batch": SEED_BATCH,
                },
                "$setOnInsert": {"created_at": datetime.utcnow()},
            },
            upsert=True,
        )

        student_summary.append(
            {
                "user_id": user_id,
                "name": name,
                "email": email,
                "password": password,
                "track": track,
                "cgpa": cgpa,
                "tenth_percentage": tenth,
                "twelfth_percentage": twelfth,
                "weighted_skill_count": len(skill_profile),
                "resume_skill_count": len(technical_skills),
                "course_count": len(all_courses),
            }
        )

    drive_ids = []
    for i, blueprint in enumerate(DRIVE_BLUEPRINTS, start=1):
        jd_structured, jd_text = _build_drive_jd(blueprint["track"], skill_pool)

        start_days = rng.randint(25, 45)
        deadline_days = start_days - rng.randint(8, 18)
        now = datetime.utcnow()
        drive_date = (now + timedelta(days=start_days)).date().isoformat()
        application_deadline = (now + timedelta(days=deadline_days)).date().isoformat()

        drive_doc = {
            "company_name": blueprint["company_name"],
            "role_title": blueprint["role_title"],
            "criteria": blueprint["criteria"],
            "application_deadline": application_deadline,
            "drive_date": drive_date,
            "package": blueprint["package"],
            "created_by": created_by,
            "jd_structured": jd_structured,
            "jd_raw_text": jd_text,
            "status": "upcoming",
            "updated_at": datetime.utcnow(),
            "is_dummy": True,
            "seed_batch": SEED_BATCH,
        }

        result = drives_col.update_one(
            {
                "company_name": blueprint["company_name"],
                "role_title": blueprint["role_title"],
                "seed_batch": SEED_BATCH,
            },
            {
                "$set": drive_doc,
                "$setOnInsert": {"created_at": datetime.utcnow()},
            },
            upsert=True,
        )

        if result.upserted_id:
            drive_id = str(result.upserted_id)
        else:
            existing = drives_col.find_one(
                {"company_name": blueprint["company_name"], "role_title": blueprint["role_title"], "seed_batch": SEED_BATCH},
                {"_id": 1},
            )
            drive_id = str(existing["_id"])
        drive_ids.append(drive_id)

    created_apps = 0
    updated_apps = 0

    student_acad_by_user = {d["user_id"]: academics_col.find_one({"user_id": d["user_id"]}) for d in student_summary}

    for drive_id in drive_ids:
        drive = drives_col.find_one({"_id": __import__("bson").ObjectId(drive_id)})
        jd = drive.get("jd_structured") or {}
        criteria = drive.get("criteria") or {}

        for s in student_summary:
            user_id = s["user_id"]
            acad = student_acad_by_user[user_id] or {}
            skill_profile = dict(acad.get("skill_profile") or {})
            for rs in acad.get("resume_skills", []) or []:
                key = _normalize_skill(str(rs))
                if key not in skill_profile:
                    skill_profile[key] = 6.0

            score = score_student_for_drive(
                student_academics=acad,
                student_skill_profile=skill_profile,
                jd_structured=jd,
                drive_criteria=criteria,
            )

            app_doc = {
                "drive_id": drive_id,
                "user_id": user_id,
                "status": "applied",
                "match_score": score.get("total_score"),
                "applied_at": datetime.utcnow() - timedelta(days=rng.randint(0, 8)),
                "is_dummy": True,
                "seed_batch": SEED_BATCH,
                "updated_at": datetime.utcnow(),
            }

            res = applications_col.update_one(
                {"drive_id": drive_id, "user_id": user_id},
                {
                    "$set": app_doc,
                    "$setOnInsert": {"created_at": datetime.utcnow()},
                },
                upsert=True,
            )
            if res.upserted_id:
                created_apps += 1
            else:
                updated_apps += 1

    output_dir = BACKEND_DIR / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    summary = {
        "generated_at": datetime.utcnow().isoformat(),
        "seed_batch": SEED_BATCH,
        "students_created_or_updated": student_summary,
        "drive_ids": drive_ids,
        "applications_created": created_apps,
        "applications_updated": updated_apps,
        "notes": "Use the email/password pairs for dummy student logins.",
    }

    summary_path = output_dir / f"dummy_placement_seed_summary_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    with summary_path.open("w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"Seed complete. Summary: {summary_path}")
    print(f"Students: {len(student_summary)} | Drives: {len(drive_ids)} | Apps created: {created_apps} | Apps updated: {updated_apps}")
    print("Dummy credentials:")
    for s in student_summary:
        print(f"- {s['name']} | {s['email']} | {s['password']} | user_id={s['user_id']}")

    client.close()


if __name__ == "__main__":
    main()
