"""
JD (Job Description) Parser Service
====================================
Extracts structured skill requirements from company job descriptions.

Two extraction strategies:
  1. **LLM-based** (Gemini) — used at JD ingestion time; produces the
     highest-quality normalised skill list.  One API call per JD.
  2. **Regex / keyword fallback** — zero LLM cost; used when Gemini is
     unavailable or for quick previews.

Output: JDStructured dict compatible with
``app.models.placement.JDStructured``.
"""

from __future__ import annotations

import json
import os
import re
import logging
from pathlib import Path
from typing import Dict, List, Optional, Set

import requests

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────
# Load the canonical skill taxonomy (flat set for quick lookup)
# ──────────────────────────────────────────────────────────────────

_TAXONOMY_PATH = Path(__file__).resolve().parent.parent / "data" / "skill_taxonomy.json"
_ALL_SKILLS: Set[str] = set()
_ALIASES: Dict[str, str] = {}

def _load_taxonomy() -> None:
    """Load skill taxonomy into module-level sets (called once)."""
    global _ALL_SKILLS, _ALIASES
    if _ALL_SKILLS:
        return
    try:
        with open(_TAXONOMY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        for key, val in data.items():
            if key.startswith("_"):
                continue
            if isinstance(val, list):
                _ALL_SKILLS.update(s.lower() for s in val)
        _ALIASES = {k.lower(): v.lower() for k, v in data.get("_aliases", {}).items()}
        logger.info("Skill taxonomy loaded: %d skills, %d aliases", len(_ALL_SKILLS), len(_ALIASES))
    except Exception as e:
        logger.warning("Could not load skill taxonomy: %s", e)

_load_taxonomy()


def _normalise_skill(raw: str) -> Optional[str]:
    """Map a raw skill string to its canonical form, or None if unknown."""
    low = raw.strip().lower()
    if low in _ALL_SKILLS:
        return low
    if low in _ALIASES:
        return _ALIASES[low]
    # Try without trailing 's' (e.g. "algorithms" → "algorithm"… but "data structures" is canonical)
    if low.endswith("s") and low[:-1] in _ALL_SKILLS:
        return low[:-1]
    return None


# ──────────────────────────────────────────────────────────────────
# Strategy 1 — Gemini LLM extraction (one call per JD)
# ──────────────────────────────────────────────────────────────────

_GEMINI_PROMPT_TEMPLATE = """You are a technical recruiter AI.  Analyse the following Job Description and extract structured skill requirements.

IMPORTANT: Map every skill to its **canonical lowercase name** from this taxonomy list.
If a skill in the JD is not in the taxonomy, include it anyway as-is in lowercase.

Taxonomy categories (for reference — do NOT output category names, just the skill names):
{taxonomy_summary}

---
JOB DESCRIPTION:
{jd_text}
---

Return ONLY valid JSON (no markdown, no explanation) with this exact schema:
{{
  "job_title": "string",
  "required_skills": [
    {{ "skill": "string (lowercase)", "weight": <float 0.0-1.0 importance> }}
  ],
  "preferred_skills": [
    {{ "skill": "string (lowercase)", "weight": <float 0.0-1.0 importance> }}
  ],
  "min_experience_years": <int or null>,
  "education_level": "string or null",
  "domain": "string (e.g. backend, frontend, data science, devops, full-stack)"
}}
"""


def _build_taxonomy_summary() -> str:
    """Build a compact taxonomy summary for the Gemini prompt."""
    try:
        with open(_TAXONOMY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return "(taxonomy unavailable)"

    lines = []
    for key, val in data.items():
        if key.startswith("_") or not isinstance(val, list):
            continue
        # Show first 15 skills per category to keep prompt size reasonable
        sample = ", ".join(val[:15])
        if len(val) > 15:
            sample += f" ... ({len(val)} total)"
        lines.append(f"  {key}: {sample}")
    return "\n".join(lines)


def extract_skills_with_gemini(jd_text: str) -> Optional[Dict]:
    """
    Call Gemini to extract structured skills from a JD.

    Returns
    -------
    dict matching JDStructured schema, or None on failure.
    """
    api_key = os.getenv("GEMINI_API")
    endpoint = os.getenv(
        "GEMINI_ENDPOINT",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    )

    if not api_key:
        logger.warning("GEMINI_API key not set — falling back to keyword extraction")
        return None

    prompt = _GEMINI_PROMPT_TEMPLATE.format(
        taxonomy_summary=_build_taxonomy_summary(),
        jd_text=jd_text[:8000],  # cap to avoid token limits
    )

    try:
        resp = requests.post(
            f"{endpoint}?key={api_key}",
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 2048,
                },
            },
            timeout=30,
        )
        resp.raise_for_status()

        data = resp.json()
        raw_text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )

        # Strip markdown fences if present
        raw_text = re.sub(r"```(?:json)?\s*", "", raw_text).strip()
        raw_text = re.sub(r"```\s*$", "", raw_text).strip()

        parsed = json.loads(raw_text)
        logger.info(
            "Gemini JD extraction: %d required, %d preferred skills",
            len(parsed.get("required_skills", [])),
            len(parsed.get("preferred_skills", [])),
        )
        return parsed

    except Exception as e:
        logger.error("Gemini JD extraction failed: %s", e)
        return None


# ──────────────────────────────────────────────────────────────────
# Strategy 2 — Keyword / regex fallback (zero LLM cost)
# ──────────────────────────────────────────────────────────────────

def extract_skills_keyword(jd_text: str) -> Dict:
    """
    Extract skills from JD text using keyword matching against the
    skill taxonomy.  No LLM call — purely algorithmic.

    Returns
    -------
    dict matching (partial) JDStructured schema.
    """
    _load_taxonomy()

    text_lower = jd_text.lower()
    found_skills: List[Dict] = []
    seen: Set[str] = set()

    # Check every canonical skill
    for skill in sorted(_ALL_SKILLS, key=len, reverse=True):
        # Require word boundaries to avoid partial matches
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower) and skill not in seen:
            seen.add(skill)
            found_skills.append({"skill": skill, "weight": 0.5})

    # Also check aliases
    for alias, canonical in _ALIASES.items():
        pattern = r"\b" + re.escape(alias) + r"\b"
        if re.search(pattern, text_lower) and canonical not in seen:
            seen.add(canonical)
            found_skills.append({"skill": canonical, "weight": 0.5})

    # Simple heuristic: skills mentioned in "required" sections get higher weight
    required_section = _extract_section(text_lower, ["required", "must have", "requirements", "mandatory"])
    preferred_section = _extract_section(text_lower, ["preferred", "nice to have", "good to have", "bonus"])

    required_skills = []
    preferred_skills = []

    for s in found_skills:
        skill = s["skill"]
        pattern = r"\b" + re.escape(skill) + r"\b"
        if required_section and re.search(pattern, required_section):
            required_skills.append({"skill": skill, "weight": 0.7})
        elif preferred_section and re.search(pattern, preferred_section):
            preferred_skills.append({"skill": skill, "weight": 0.3})
        else:
            # Default: treat as required with moderate weight
            required_skills.append({"skill": skill, "weight": 0.5})

    return {
        "job_title": None,
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "min_experience_years": _extract_experience(text_lower),
        "education_level": None,
        "domain": None,
    }


def _extract_section(text: str, keywords: List[str]) -> Optional[str]:
    """Try to extract a section of text following one of the keywords."""
    for kw in keywords:
        idx = text.find(kw)
        if idx >= 0:
            # Take ~500 chars after the keyword
            return text[idx:idx + 500]
    return None


def _extract_experience(text: str) -> Optional[int]:
    """Extract minimum years of experience from text."""
    patterns = [
        r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)",
        r"experience\s*[:\-]?\s*(\d+)\+?\s*(?:years?|yrs?)",
        r"minimum\s+(\d+)\s*(?:years?|yrs?)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return int(m.group(1))
    return None


# ──────────────────────────────────────────────────────────────────
# JD PDF text extraction
# ──────────────────────────────────────────────────────────────────

async def extract_text_from_jd_pdf(file_bytes: bytes) -> str:
    """Extract plain text from a JD PDF file."""
    try:
        import fitz
    except ImportError:
        raise RuntimeError("PyMuPDF (fitz) required. pip install PyMuPDF")

    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text


# ──────────────────────────────────────────────────────────────────
# Main entry point
# ──────────────────────────────────────────────────────────────────

async def parse_jd(
    jd_text: Optional[str] = None,
    jd_pdf_bytes: Optional[bytes] = None,
    use_llm: bool = True,
) -> Dict:
    """
    Parse a Job Description and return structured skill data.

    Exactly one of ``jd_text`` or ``jd_pdf_bytes`` must be provided.

    Parameters
    ----------
    jd_text : str, optional
        Plain text JD.
    jd_pdf_bytes : bytes, optional
        Raw PDF bytes — text is extracted first.
    use_llm : bool
        If True (default), attempts Gemini extraction first, falls
        back to keyword matching.  If False, uses keyword-only.

    Returns
    -------
    dict compatible with ``JDStructured`` Pydantic model.
    """
    if jd_pdf_bytes:
        jd_text = await extract_text_from_jd_pdf(jd_pdf_bytes)

    if not jd_text or not jd_text.strip():
        return {
            "job_title": None,
            "required_skills": [],
            "preferred_skills": [],
            "min_experience_years": None,
            "education_level": None,
            "domain": None,
        }

    result = None
    if use_llm:
        result = extract_skills_with_gemini(jd_text)

    if result is None:
        result = extract_skills_keyword(jd_text)

    return result
