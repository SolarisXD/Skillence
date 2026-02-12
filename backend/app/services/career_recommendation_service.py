"""
Career Recommendation Service — ML pre-filter + Gemini ranking.

Flow:
  1. Pre-compute binary occupation–skill profiles from training data (lazy, cached).
  2. Map the user's resume skills to the 692-skill vocabulary (exact match).
  3. Dot-product against all 894 occupation profiles → top 30 candidates (~1 ms).
  4. Single Gemini call: rank top 30 → final top 10 with scores + explanations.
  5. Enrich with hot-technology match data for the UI.
"""

import os
import json
import re
import logging
from typing import Dict, List, Tuple, Optional, Set
from collections import defaultdict

import numpy as np
import requests

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths (relative to this file → backend/app/services/)
# ---------------------------------------------------------------------------
_SVC_DIR = os.path.dirname(os.path.abspath(__file__))
_APP_DIR = os.path.dirname(_SVC_DIR)  # backend/app/
_ML_PROCESSED = os.path.join(_APP_DIR, "ml", "data", "processed")
_CAREER_DATA = os.path.join(_APP_DIR, "career_data")

# Common skill aliases  (resume term → vocab term)
_SKILL_ALIASES: Dict[str, str] = {
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "cpp": "c++",
    "c#": "c#",
    "ml": "machine learning",
    "dl": "deep learning",
    "nlp": "natural language processing",
    "cv": "computer vision",
    "k8s": "kubernetes",
    "tf": "tensorflow",
    "gcp": "google cloud platform",
    "ci/cd": "continuous integration and continuous delivery ci/cd software",
    "rest": "rest api",
    "nosql": "nosql",
    "postgres": "postgresql",
    "mongo": "mongodb",
    "node": "node.js",
    "vue": "vue.js",
    "express": "express.js",
    "angular": "angular",
    "flask": "flask",
    "django": "django",
    "spring": "spring framework",
    "spring boot": "spring boot",
    "html": "html",
    "css": "css",
    "sass": "sass",
}


class CareerRecommendationService:
    """Singleton service — loads data once, answers instantly after that."""

    _instance: Optional["CareerRecommendationService"] = None

    @classmethod
    def get_instance(cls) -> "CareerRecommendationService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # --------------------------------------------------------------------- #
    def __init__(self) -> None:
        self._loaded = False
        # Populated by _ensure_loaded()
        self._skill_to_idx: Dict[str, int] = {}
        self._idx_to_skill: Dict[int, str] = {}
        self._profiles: np.ndarray = np.array([])  # (N, 692) binary
        self._occ_codes: List[str] = []
        self._title_map: Dict[str, str] = {}
        self._hot_tech_map: Dict[str, Set[str]] = {}      # code → set of hot tech names
        self._all_tech_map: Dict[str, Set[str]] = {}       # code → set of all tech names

    # --------------------------------------------------------------------- #
    # Data loading (runs once)
    # --------------------------------------------------------------------- #
    def _ensure_loaded(self) -> None:
        if self._loaded:
            return
        logger.info("CareerRecommendationService: loading data …")
        self._load_skill_index()
        self._load_occupation_profiles()
        self._load_technology_skills()
        self._loaded = True
        logger.info(
            "CareerRecommendationService: ready — %d occupations, %d skills",
            len(self._occ_codes),
            len(self._skill_to_idx),
        )

    def _load_skill_index(self) -> None:
        path = os.path.join(_ML_PROCESSED, "skill_index.json")
        with open(path, "r", encoding="utf-8") as f:
            self._skill_to_idx = json.load(f)
        self._idx_to_skill = {v: k for k, v in self._skill_to_idx.items()}

    def _load_occupation_profiles(self) -> None:
        labels_path = os.path.join(_ML_PROCESSED, "occupation_labels.json")
        vectors_path = os.path.join(_ML_PROCESSED, "skill_vectors.npy")
        onet_path = os.path.join(_CAREER_DATA, "onet_occupations_data.json")

        with open(labels_path, "r", encoding="utf-8") as f:
            occ_labels: List[str] = json.load(f)
        vectors: np.ndarray = np.load(vectors_path)  # (17375, 692)
        with open(onet_path, "r", encoding="utf-8") as f:
            onet_data: List[dict] = json.load(f)

        # Title lookup
        self._title_map = {occ["occupation_code"]: occ["title"] for occ in onet_data}

        # Group training vectors by known O*NET occupation
        groups: Dict[str, List[int]] = defaultdict(list)
        for i, code in enumerate(occ_labels):
            if code in self._title_map:
                groups[code].append(i)

        self._occ_codes = sorted(groups.keys())
        n = len(self._occ_codes)
        dim = vectors.shape[1]
        self._profiles = np.zeros((n, dim), dtype=np.float32)
        for i, code in enumerate(self._occ_codes):
            idxs = groups[code]
            avg = vectors[idxs].mean(axis=0)
            self._profiles[i] = (avg > 0.5).astype(np.float32)  # binarize

    def _load_technology_skills(self) -> None:
        """Load hot-technology sets per occupation from the Technology Skills Excel."""
        try:
            import pandas as pd
        except ImportError:
            logger.warning("pandas not available — hot tech data skipped")
            return

        path = os.path.join(_CAREER_DATA, "skills_data", "Technology Skills.xlsx")
        if not os.path.exists(path):
            logger.warning("Technology Skills.xlsx not found — hot tech data skipped")
            return

        try:
            df = pd.read_excel(path)
            for _, row in df.iterrows():
                code = str(row.get("O*NET-SOC Code", "")).strip()
                if code not in self._title_map:
                    continue
                example = str(row.get("Example", "")).strip().lower()
                hot = str(row.get("Hot Technology", "N")).strip()
                if not example or example == "nan" or len(example) < 3:
                    continue

                if code not in self._all_tech_map:
                    self._all_tech_map[code] = set()
                    self._hot_tech_map[code] = set()

                self._all_tech_map[code].add(example)
                if hot == "Y":
                    self._hot_tech_map[code].add(example)
        except Exception as exc:
            logger.error("Error loading Technology Skills: %s", exc)

    # --------------------------------------------------------------------- #
    # Skill extraction from user profile
    # --------------------------------------------------------------------- #
    @staticmethod
    def _extract_skills_from_profile(profile: dict) -> List[str]:
        """Pull every plausible skill string from the MongoDB profile document."""
        skills: Set[str] = set()
        pd_data = profile.get("profile_data", {})

        # Technical skills list
        skills_section = pd_data.get("skills", {})
        if isinstance(skills_section, dict):
            for lst in skills_section.values():
                if isinstance(lst, list):
                    for s in lst:
                        if isinstance(s, str):
                            skills.add(s.strip())
        elif isinstance(skills_section, list):
            for s in skills_section:
                if isinstance(s, str):
                    skills.add(s.strip())

        # Project technologies
        for proj in pd_data.get("projects", []):
            if isinstance(proj, dict):
                for tech in proj.get("technologies", []):
                    if isinstance(tech, str):
                        skills.add(tech.strip())
                # Also grab tech keywords from project name/description
                for field in ("name", "description"):
                    txt = proj.get(field, "")
                    if isinstance(txt, str):
                        skills.update(
                            re.findall(
                                r"\b(?:Python|Java|C\+\+|JavaScript|TypeScript|React|Angular|Vue|"
                                r"Node\.?js|MongoDB|PostgreSQL|MySQL|SQL|NoSQL|Docker|Kubernetes|"
                                r"AWS|Azure|GCP|TensorFlow|PyTorch|Pandas|NumPy|Flask|Django|"
                                r"FastAPI|Spring|Spring Boot|GraphQL|REST|Redis|Kafka|Jenkins|"
                                r"Git|GitHub|Tableau|Spark|Hadoop|Airflow|Jupyter|Scikit|OpenCV|"
                                r"BERT|GPT|Transformer|LLM|NLP|Machine Learning|Deep Learning|"
                                r"Computer Vision|HTML|CSS|Sass|Tailwind|Next\.?js|Express|Vite|"
                                r"Firebase|Supabase|Terraform|Ansible|Linux|Rust|Go|Kotlin|Swift|"
                                r"R\b|Scala|MATLAB|Power ?BI|Excel|Figma|Photoshop)\b",
                                txt,
                                re.IGNORECASE,
                            )
                        )

        # Certifications
        for cert in pd_data.get("certifications", []):
            if isinstance(cert, dict):
                name = cert.get("name", "")
                if isinstance(name, str):
                    skills.add(name.strip())

        # Work experience technologies
        for exp in pd_data.get("experience", []):
            if isinstance(exp, dict):
                for tech in exp.get("technologies", []):
                    if isinstance(tech, str):
                        skills.add(tech.strip())

        return [s for s in skills if s]

    # --------------------------------------------------------------------- #
    def _map_skills_to_vector(self, raw_skills: List[str]) -> Tuple[np.ndarray, List[str]]:
        """Map user skill strings → 692-dim binary vector. Returns (vector, matched_skill_names)."""
        vec = np.zeros(len(self._skill_to_idx), dtype=np.float32)
        matched: List[str] = []

        for skill in raw_skills:
            sl = skill.lower().strip()

            # 1) Direct exact match
            if sl in self._skill_to_idx:
                vec[self._skill_to_idx[sl]] = 1.0
                matched.append(sl)
                continue

            # 2) Alias match
            alias = _SKILL_ALIASES.get(sl)
            if alias and alias in self._skill_to_idx:
                vec[self._skill_to_idx[alias]] = 1.0
                matched.append(alias)
                continue

            # 3) Fuzzy: try prefixed entries (e.g. "aws" → "amazon web services aws software")
            #    Only for skills ≥ 4 chars to avoid noise
            if len(sl) >= 4:
                for vocab_skill, idx in self._skill_to_idx.items():
                    # Check if the user skill is a standalone word in the vocab entry
                    if re.search(rf"\b{re.escape(sl)}\b", vocab_skill):
                        vec[idx] = 1.0
                        matched.append(vocab_skill)
                        break

        return vec, list(set(matched))

    # --------------------------------------------------------------------- #
    # Core recommendation logic
    # --------------------------------------------------------------------- #
    def get_recommendations(
        self,
        profile: dict,
        top_k: int = 10,
    ) -> Tuple[List[dict], str, int]:
        """
        Returns (recommendations, profile_summary, total_skills_matched).

        Each recommendation dict:
            occupation_code, title, score, hot_tech_matches, regular_tech_matches,
            explanation, tech_score, traditional_score, ai_score, required_skills,
            hot_technologies
        """
        self._ensure_loaded()

        # --- 1. Build user vector ----------------------------------------- #
        raw_skills = self._extract_skills_from_profile(profile)
        user_vec, matched_skills = self._map_skills_to_vector(raw_skills)
        n_matched = int(user_vec.sum())
        logger.info("Mapped %d raw skills → %d vocab matches", len(raw_skills), n_matched)

        if n_matched == 0:
            return [], self._build_summary(profile), 0

        # --- 2. Dot-product pre-filter ------------------------------------ #
        scores = self._profiles @ user_vec  # (N,)  count of shared skills
        pre_k = min(30, len(self._occ_codes))
        top_indices = np.argsort(scores)[::-1][:pre_k]

        candidates = []
        for idx in top_indices:
            code = self._occ_codes[idx]
            candidates.append(
                {
                    "idx": int(idx),
                    "code": code,
                    "title": self._title_map.get(code, "Unknown"),
                    "shared": int(scores[idx]),
                }
            )

        # --- 3. Gemini ranking -------------------------------------------- #
        gemini_ranked = self._gemini_rank(matched_skills, candidates, profile)

        # --- 4. Build final results --------------------------------------- #
        results: List[dict] = []
        for entry in gemini_ranked[:top_k]:
            code = entry["code"]
            title = entry["title"]
            score = entry["score"]
            explanation = entry.get("explanation", "")

            hot_matches, reg_matches = self._tag_tech_matches(code, matched_skills)

            results.append(
                {
                    "occupation_code": code,
                    "title": title,
                    "score": score,
                    "tech_score": score,
                    "traditional_score": score,
                    "ai_score": score,
                    "hot_tech_matches": hot_matches,
                    "regular_tech_matches": reg_matches,
                    "required_skills": matched_skills[:5],
                    "hot_technologies": list(self._hot_tech_map.get(code, set()))[:8],
                    "explanation": explanation,
                }
            )

        return results, self._build_summary(profile), n_matched

    # --------------------------------------------------------------------- #
    # Gemini ranking
    # --------------------------------------------------------------------- #
    def _gemini_rank(
        self,
        user_skills: List[str],
        candidates: List[dict],
        profile: dict,
    ) -> List[dict]:
        """Ask Gemini to rank ~30 candidates → return ordered list with scores."""
        gemini_api = os.getenv("GEMINI_API")
        gemini_endpoint = os.getenv("GEMINI_ENDPOINT")

        if not gemini_api or not gemini_endpoint:
            logger.warning("Gemini not configured — using ML pre-filter scores only")
            return self._fallback_rank(candidates)

        # Build concise prompt
        profile_summary = self._build_summary(profile)
        numbered_candidates = "\n".join(
            f"{i+1}. {c['title']} ({c['code']}) [skill overlap: {c['shared']}]"
            for i, c in enumerate(candidates)
        )

        # Build a code→candidate lookup for robust response parsing
        code_to_candidate: Dict[str, dict] = {c["code"]: c for c in candidates}

        prompt = f"""You are a career matching expert. Rank these occupations for the candidate below.

SKILLS: {', '.join(user_skills[:25])}
PROFILE: {profile_summary}

OCCUPATIONS:
{numbered_candidates}

Select the 10 best matches. Score 0.50-0.99, differentiate clearly. Skip irrelevant occupations (e.g. teaching roles for a tech candidate). One-sentence explanation each.

Return ONLY this JSON (no markdown, no backticks):
[{{"code":"15-XXXX.XX","score":0.95,"explanation":"..."}}]"""

        try:
            headers = {"Content-Type": "application/json"}
            params = {"key": gemini_api}
            payload = {
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 8192,
                },
            }

            resp = requests.post(
                gemini_endpoint,
                headers=headers,
                params=params,
                json=payload,
                timeout=45,
            )
            resp.raise_for_status()
            data = resp.json()

            text = data["candidates"][0]["content"]["parts"][0]["text"]
            # Strip markdown code fences if present
            text = re.sub(r"```(?:json)?\s*", "", text).strip()
            # Extract JSON array
            json_match = re.search(r"\[.*\]", text, re.DOTALL)
            if not json_match:
                logger.warning("Gemini returned no JSON — falling back. Raw: %s", text[:300])
                return self._fallback_rank(candidates)

            rankings = json.loads(json_match.group())

            # Map back to candidate data — handle code-based or number-based responses
            ranked: List[dict] = []
            for item in rankings:
                c = None
                # Try matching by occupation code first
                code_val = str(item.get("code", "")).strip()
                if code_val in code_to_candidate:
                    c = code_to_candidate[code_val]
                else:
                    # Try matching by position number (1-indexed)
                    num_val = item.get("number")
                    if num_val is not None:
                        try:
                            idx = int(num_val) - 1
                            if 0 <= idx < len(candidates):
                                c = candidates[idx]
                        except (ValueError, TypeError):
                            pass

                if c is not None:
                    ranked.append(
                        {
                            "code": c["code"],
                            "title": c["title"],
                            "score": float(item.get("score", 0.5)),
                            "explanation": item.get("explanation", ""),
                        }
                    )
            if ranked:
                logger.info("Gemini ranked %d occupations successfully", len(ranked))
                return ranked

        except Exception as exc:
            logger.error("Gemini ranking failed: %s", exc)

        return self._fallback_rank(candidates)

    def _fallback_rank(self, candidates: List[dict]) -> List[dict]:
        """If Gemini fails, produce deterministic scores from the pre-filter."""
        if not candidates:
            return []
        max_shared = max(c["shared"] for c in candidates) or 1
        return [
            {
                "code": c["code"],
                "title": c["title"],
                "score": round(0.50 + 0.45 * (c["shared"] / max_shared), 4),
                "explanation": f"Matches {c['shared']} of your technical skills.",
            }
            for c in candidates
        ]

    # --------------------------------------------------------------------- #
    # Helpers
    # --------------------------------------------------------------------- #
    def _tag_tech_matches(
        self, occ_code: str, user_skills: List[str]
    ) -> Tuple[List[str], List[str]]:
        """Split matched skills into hot-tech and regular for the UI."""
        hot_set = self._hot_tech_map.get(occ_code, set())
        all_set = self._all_tech_map.get(occ_code, set())

        hot_matches: List[str] = []
        reg_matches: List[str] = []

        for skill in user_skills:
            sl = skill.lower()
            is_hot = any(sl in h or h in sl for h in hot_set)
            is_reg = any(sl in t or t in sl for t in all_set)
            if is_hot:
                hot_matches.append(skill)
            elif is_reg:
                reg_matches.append(skill)
            else:
                reg_matches.append(skill)  # still a matched skill, show it

        return hot_matches[:10], reg_matches[:10]

    @staticmethod
    def _build_summary(profile: dict) -> str:
        pd_data = profile.get("profile_data", {})
        parts: List[str] = []

        # Skills
        skills_section = pd_data.get("skills", {})
        tech_skills: List[str] = []
        if isinstance(skills_section, dict):
            tech_skills = skills_section.get("technical", [])
        if tech_skills:
            parts.append(f"Technical Skills: {', '.join(tech_skills[:12])}")

        # Education
        for edu in pd_data.get("education", []):
            if isinstance(edu, dict):
                degree = edu.get("degree", "")
                inst = edu.get("institution", "")
                if degree and inst:
                    parts.append(f"Education: {degree} from {inst}")
                    break

        # Projects
        proj_names = []
        for proj in pd_data.get("projects", [])[:3]:
            if isinstance(proj, dict) and proj.get("name"):
                proj_names.append(proj["name"])
        if proj_names:
            parts.append(f"Key Projects: {', '.join(proj_names)}")

        # Experience
        for exp in pd_data.get("experience", [])[:2]:
            if isinstance(exp, dict):
                title = exp.get("title", "")
                company = exp.get("company", "")
                if title:
                    parts.append(f"Experience: {title}" + (f" at {company}" if company else ""))
                    break

        return ". ".join(parts) if parts else "No profile information available"
