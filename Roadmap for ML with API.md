# Roadmap for ML with API
## Skillence — Machine Learning Integration with O*NET & JSearch APIs

**Project:** Skillence — AI-Powered Career Intelligence Platform  
**Goal:** Integrate Deep Learning models trained on real-time API data to enhance career guidance with data-driven predictions  
**Focus:** Indian Job Market  
**Timeline:** 4–5 Weeks  
**Last Updated:** February 6, 2026

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [ML Integration Strategy — Why These 3 Models](#3-ml-integration-strategy--why-these-3-models)
4. [Data Pipeline Architecture](#4-data-pipeline-architecture)
5. [Model 1 — Salary Predictor (Deep Learning MLP)](#5-model-1--salary-predictor-deep-learning-mlp)
6. [Model 2 — Resume-Job Compatibility Scorer (Embedding + Neural Ranker)](#6-model-2--resume-job-compatibility-scorer-embedding--neural-ranker)
7. [Model 3 — Skill Recommender (Autoencoder)](#7-model-3--skill-recommender-autoencoder)
8. [Directory Structure & New Files](#8-directory-structure--new-files)
9. [Tech Stack & Dependencies](#9-tech-stack--dependencies)
10. [Frontend Integration Points](#10-frontend-integration-points)
11. [Implementation Phases](#11-implementation-phases)
12. [Retraining Pipeline](#12-retraining-pipeline)
13. [Evaluation Metrics & Success Criteria](#13-evaluation-metrics--success-criteria)
14. [How to Explain to Teachers](#14-how-to-explain-to-teachers)

---

## 1. Executive Summary

Skillence currently relies on **Gemini AI (LLM) + keyword matching** for career recommendations, salary averages, and learning plans. While functional, these approaches have clear limitations:

- **Salary data** is just a static average from CSV — not personalized to the user's profile.
- **Career matching** uses token overlap (keyword matching) — misses semantic relationships (e.g., "Machine Learning" ≈ "Deep Learning").
- **Skill recommendations** come entirely from Gemini prompts — not grounded in real job market data.

This roadmap introduces **3 Deep Learning models** that solve these problems by training on real data from **O\*NET API** (occupation/skill data) and **JSearch API** (real-time Indian job postings). The models are:

| # | Model | Type | Integrates Into | Purpose |
|---|-------|------|-----------------|---------|
| 1 | **Salary Predictor** | PyTorch MLP (Neural Network) | Job Trends / Profile Page | Predict personalized salary based on user's skills, experience, location |
| 2 | **Resume-Job Matcher** | Sentence Embeddings + Neural Scorer | Career Path Recommendation | Semantic compatibility scoring between user profile and job descriptions |
| 3 | **Skill Recommender** | Autoencoder (Unsupervised DL) | Learning Roadmap | Recommend which skills to learn next based on co-occurrence patterns |

**Key Principles:**
- Models are trained **locally** and served locally — no cloud ML deployment needed
- Data is collected via APIs, stored as files — **retraining is just running a script**
- All models focus on the **Indian job market** (Indian cities, INR salaries, Indian job postings)
- Each model replaces or enhances an existing feature — nothing is bolted on artificially

---

## 2. Current State Analysis

### Existing Features & Their Current Approach

| Feature | Current Approach | Limitation |
|---------|-----------------|------------|
| **Job Trends Dashboard** | Shows averages/distributions from 15K CSV records | Static, not personalized, no predictions |
| **Career Path Recommendation** | Token overlap matching between user skills & O\*NET data + Gemini AI scoring | Keyword-based, misses semantic similarity |
| **Learning Roadmap** | Gemini AI generates skill learning order | No data-driven prioritization, purely LLM opinion |
| **Job Offer Evaluator** | Adzuna API + Gemini analysis | No ML-based fit scoring |
| **Profile Page** | Displays parsed resume data | No predicted insights |
| **Chatbot** | Gemini-powered conversational AI | Pure LLM, no trained model backing it |

### Existing Data Assets

| Data Source | What It Contains | Records |
|-------------|-----------------|---------|
| `ai_job_dataset.csv` + `ai_job_dataset1.csv` | job_title, salary_usd, experience_level, employment_type, company_location, company_size, required_skills, education_required, years_experience, industry, benefits_score | ~15,000 |
| O\*NET Excel Files (Skills.xlsx, Technology Skills.xlsx, Knowledge.xlsx) | Skill importance scores, technology skills per occupation, hot technologies, knowledge areas | 900+ occupations |
| `onet_occupations_data.json` | Occupation titles, codes, descriptions | 900+ occupations |
| MongoDB User Profiles | User skills, education, experience, projects, certifications | Dynamic |

### Available APIs (Already Have Keys)

| API | Purpose | Rate Limit |
|-----|---------|-----------|
| **O\*NET Web Services** | Occupation data, skills, knowledge, abilities, tech skills | Generous (free tier, no strict limit) |
| **JSearch (RapidAPI)** | Real-time job postings, salary estimates, job details | 500 requests/month (free tier) |
| **Gemini AI** | Already integrated for chatbot, career analysis, roadmap generation | Already in use |
| **Adzuna** | Job data for Job Offer Evaluator | Already in use |

---

## 3. ML Integration Strategy — Why These 3 Models

### Selection Criteria
Each model was chosen based on these requirements:
- ✅ Uses **Deep Learning** (not just traditional ML)
- ✅ Integrates into an **existing feature** (not a standalone gimmick)
- ✅ Provides **real value** that the current approach doesn't (explainable improvement)
- ✅ Can be trained on **available data** from our APIs
- ✅ Is **practical** for a local/small project (no GPU server needed)
- ✅ Focuses on **Indian job market**
- ✅ Supports **retraining** when new data is collected

### Why Not Other Approaches?

| Approach Considered | Why Rejected |
|---------------------|-------------|
| **Reinforcement Learning** | Needs continuous user interaction data and reward signals we don't have. Hard to define proper reward function without real user outcomes (did they get the job?). More theoretical than practical for our data. |
| **LSTM Time-Series Forecasting** | Only ~6 months of historical data in CSVs. JSearch free tier (500 req/month) can't support continuous temporal data collection. Would produce poor predictions with limited data. |
| **Large Language Model Fine-tuning** | Requires significant compute. We already use Gemini via API. Fine-tuning adds complexity without clear advantage over prompt engineering. |
| **Computer Vision Models** | No image data in our domain. Resume parsing already uses Azure AI. |
| **GANs** | No generative use case that fits naturally. Generating fake job data defeats the purpose. |

### The 3 Chosen Models — How They Fit

```
┌─────────────────────────────────────────────────────────────────────┐
│                     EXISTING FEATURES                                │
├──────────────┬──────────────────┬──────────────────┬────────────────┤
│  Job Trends  │  Career Path     │  Learning        │  Profile       │
│  Dashboard   │  Recommendation  │  Roadmap         │  Page          │
├──────────────┼──────────────────┼──────────────────┼────────────────┤
│      ↑       │        ↑         │        ↑         │      ↑        │
│  MODEL 1     │    MODEL 2       │    MODEL 3       │  MODEL 1      │
│  Salary      │    Job-Resume    │    Skill         │  (also shown  │
│  Predictor   │    Matcher       │    Recommender   │   on Profile) │
│  (MLP)       │    (Embeddings)  │    (Autoencoder) │               │
├──────────────┴──────────────────┴──────────────────┴────────────────┤
│                    ML INFERENCE SERVICE                              │
│              FastAPI Router: /api/ml/*                               │
├─────────────────────────────────────────────────────────────────────┤
│                    TRAINED MODEL FILES                               │
│         salary_model.pt  │  matcher_model.pt  │  recommender.pt     │
├─────────────────────────────────────────────────────────────────────┤
│                    TRAINING PIPELINE                                 │
│         Processed datasets → PyTorch training scripts               │
├─────────────────────────────────────────────────────────────────────┤
│                    DATA PROCESSING LAYER                             │
│      Feature engineering, text encoding, normalization              │
├─────────────────────────────────────────────────────────────────────┤
│                    RAW DATA COLLECTION                               │
│           O*NET API    │    JSearch API    │   Existing CSVs         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline Architecture

### Overview

The pipeline has 4 stages. Each stage is a **standalone script** that can be run independently. No schedulers, no cron jobs, no cloud services.

```
Stage 1                Stage 2               Stage 3              Stage 4
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  COLLECT │ ──→ │   PROCESS    │ ──→ │    TRAIN     │ ──→ │    SERVE     │
│  Data    │     │  & Engineer  │     │   Models     │     │  Predictions │
│  from    │     │  Features    │     │   (PyTorch)  │     │  (FastAPI)   │
│  APIs    │     │              │     │              │     │              │
└──────────┘     └──────────────┘     └──────────────┘     └──────────────┘
  Scripts/          Scripts/             Scripts/            Runtime
  Manual run        Manual run           Manual run          Auto on startup
```

### Stage 1: Data Collection

**Script:** `backend/app/ml/data_collection/collect_all.py`

**O\*NET API Collection:**
- Fetch all tech-related occupations (SOC prefix `15-`, `17-`)
- For each occupation: skills, knowledge, abilities, technology skills
- Store as `backend/app/ml/data/raw/onet_occupations.json`
- ~200-300 occupations × 5 API calls each = ~1500 calls (no strict rate limit)

**JSearch API Collection (India-focused):**
- Search queries: 10 job categories × 6 Indian cities × 2 pages
- Job categories: "Software Engineer", "Data Scientist", "ML Engineer", "Web Developer", "DevOps Engineer", "Data Analyst", "Full Stack Developer", "Backend Developer", "Frontend Developer", "Cloud Engineer"
- Indian cities: Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Pune
- Also fetch salary estimates: `GET /estimated-salary` for each category × city
- Total: ~120-150 requests per collection run (well within 500/month)
- Store as `backend/app/ml/data/raw/jsearch_jobs_india.json` and `backend/app/ml/data/raw/jsearch_salaries_india.json`

**Existing Data Integration:**
- Read `ai_job_dataset.csv` + `ai_job_dataset1.csv` (15K records)
- These are global records — we'll use them as supplementary training data
- Indian records in the CSV are extracted and given higher weight

### Stage 2: Data Processing & Feature Engineering

**Script:** `backend/app/ml/data_collection/data_processor.py`

**For Salary Model:**
1. Merge CSV data + JSearch salary data + JSearch job data (salary fields)
2. Convert all salaries to INR (Lakhs Per Annum) using exchange rate
3. Clean outliers using IQR method (remove salaries < 1 LPA or > 100 LPA)
4. Encode features:
   - `years_experience` → numeric (cap at 20)
   - `education_level` → ordinal (0=High School, 1=Associate, 2=Bachelor, 3=Master, 4=PhD)
   - `experience_level` → one-hot (Entry/Mid/Senior/Executive)
   - `employment_type` → one-hot (Full-time/Part-time/Contract/Freelance)
   - `company_size` → one-hot (Small/Medium/Large)
   - `remote_ratio` → numeric (0/50/100 normalized to 0-1)
   - `industry` → label encoded (top 15 industries, rest = "Other")
   - `location_tier` → one-hot (Tier1=BLR/MUM/DEL, Tier2=HYD/CHN/PUN, Tier3=others)
   - `skill_flags` → 20 binary columns for top skills (Python, ML, AWS, etc.)
   - `num_skills` → count of required skills
5. Output: `backend/app/ml/data/processed/salary_training_data.csv`

**For Job Matcher:**
1. Create text pairs: (user_skill_text, job_description_text)
2. From JSearch: job descriptions with required skills
3. From O\*NET: occupation descriptions with required skills/knowledge
4. Construct training pairs:
   - **Positive (label=1):** User skills are a subset of job required skills
   - **Negative (label=0):** Random mismatched pairs
   - **Partial (label=0.3-0.7):** Some skill overlap, score proportional to overlap
5. Output: `backend/app/ml/data/processed/matching_pairs.csv`

**For Skill Recommender:**
1. Extract skill vectors from all job postings
2. Unique skills list: union of all required_skills across all records
3. Each job posting → binary vector (1 if skill present, 0 if not)
4. Include O\*NET skill importance scores as additional signal
5. Output: `backend/app/ml/data/processed/skill_vectors.csv` + `backend/app/ml/data/processed/skill_index.json`

### Stage 3: Model Training

**Scripts:** `backend/app/ml/training/train_salary_model.py`, etc.

Detailed in the individual model sections below (Sections 5, 6, 7).

### Stage 4: Model Serving

**Router:** `backend/app/routers/ml_predictions.py`

Models are loaded once at FastAPI startup. Inference is CPU-only and takes milliseconds. No GPU needed for serving.

---

## 5. Model 1 — Salary Predictor (Deep Learning MLP)

### Problem Statement
Students and job seekers in India don't know what salary to expect for a given role based on their specific qualifications. Existing platforms like Glassdoor/AmbitionBox give broad ranges but don't personalize based on a user's exact skill set, experience level, and target location.

**Currently in our app:** The Job Trends page shows static average salary from CSV data. No personalization.

**After ML integration:** User clicks "Predict My Salary" → model predicts their estimated salary based on their profile data.

### Data Sources
| Source | What We Get | Records |
|--------|------------|---------|
| Existing CSVs | Global salary data with features | ~15,000 |
| JSearch `/estimated-salary` | India-specific salary estimates per role per city | ~60 data points per collection |
| JSearch `/search` | Indian job postings with salary fields | ~1,000-2,000 per collection |
| O\*NET API | Occupation-level context (skill requirements) | ~300 occupations |

### Feature Engineering

**Input Features (~50 dimensions):**

| Feature | Type | Encoding | Source |
|---------|------|----------|--------|
| `years_experience` | Numeric | Min-max normalized (0-1) | CSV / JSearch |
| `education_level` | Ordinal | 0-4 (HS/Assoc/Bach/Master/PhD) | CSV / JSearch |
| `experience_level_EN` | Binary | One-hot | CSV |
| `experience_level_MI` | Binary | One-hot | CSV |
| `experience_level_SE` | Binary | One-hot | CSV |
| `experience_level_EX` | Binary | One-hot | CSV |
| `employment_FT` | Binary | One-hot | CSV |
| `employment_PT` | Binary | One-hot | CSV |
| `employment_CT` | Binary | One-hot | CSV |
| `employment_FL` | Binary | One-hot | CSV |
| `company_size_S` | Binary | One-hot | CSV |
| `company_size_M` | Binary | One-hot | CSV |
| `company_size_L` | Binary | One-hot | CSV |
| `remote_ratio` | Numeric | Normalized 0-1 | CSV |
| `location_tier_1` | Binary | Bangalore/Mumbai/Delhi | Derived |
| `location_tier_2` | Binary | Hyderabad/Chennai/Pune | Derived |
| `location_tier_3` | Binary | Other Indian cities | Derived |
| `location_international` | Binary | Non-India | Derived |
| `num_skills` | Numeric | Normalized | CSV / JSearch |
| `has_python` | Binary | Skill flag | CSV |
| `has_ml` | Binary | Skill flag | CSV |
| `has_deep_learning` | Binary | Skill flag | CSV |
| `has_aws` | Binary | Skill flag | CSV |
| `has_docker` | Binary | Skill flag | CSV |
| `has_sql` | Binary | Skill flag | CSV |
| `has_java` | Binary | Skill flag | CSV |
| `has_javascript` | Binary | Skill flag | CSV |
| `has_react` | Binary | Skill flag | CSV |
| `has_tensorflow` | Binary | Skill flag | CSV |
| `has_pytorch` | Binary | Skill flag | CSV |
| `has_kubernetes` | Binary | Skill flag | CSV |
| `has_cloud` | Binary | Skill flag | CSV |
| `has_nlp` | Binary | Skill flag | CSV |
| `has_data_analysis` | Binary | Skill flag | CSV |
| `has_linux` | Binary | Skill flag | CSV |
| `industry_*` | Binary | Top 15 industries one-hot | CSV |

**Target Variable:** `salary_lpa` (Salary in Lakhs Per Annum, INR)

### Model Architecture (PyTorch)

```
SalaryPredictorMLP
├── Input Layer: ~50 features
│
├── Hidden Layer 1: Linear(50 → 128) + BatchNorm + ReLU + Dropout(0.3)
├── Hidden Layer 2: Linear(128 → 64) + BatchNorm + ReLU + Dropout(0.2)
├── Hidden Layer 3: Linear(64 → 32) + BatchNorm + ReLU + Dropout(0.1)
│
├── Output Layer: Linear(32 → 1)
│
├── Loss Function: Huber Loss (robust to salary outliers)
├── Optimizer: Adam (lr=0.001, weight_decay=1e-5)
├── Scheduler: ReduceLROnPlateau (patience=10, factor=0.5)
│
├── Training: 200 epochs with early stopping (patience=20)
├── Batch Size: 64
├── Train/Val/Test Split: 70/15/15
└── Data Augmentation: Add small Gaussian noise to numeric features
```

### Training Script Pseudocode
```python
# backend/app/ml/training/train_salary_model.py

import torch
import torch.nn as nn
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

class SalaryMLP(nn.Module):
    def __init__(self, input_dim):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(32, 1)
        )
    
    def forward(self, x):
        return self.network(x)

# Load processed data
data = pd.read_csv("data/processed/salary_training_data.csv")
X, y = data.drop("salary_lpa", axis=1), data["salary_lpa"]

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split
X_train, X_test, y_train, y_test = train_test_split(...)

# Train
model = SalaryMLP(input_dim=X.shape[1])
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
criterion = nn.HuberLoss()

for epoch in range(200):
    # Forward pass, backward pass, optimize
    ...

# Save model + scaler
torch.save(model.state_dict(), "models/saved/salary_model.pt")
joblib.dump(scaler, "models/saved/salary_scaler.pkl")
```

### API Endpoint

```
POST /api/ml/predict-salary

Request Body:
{
  "years_experience": 3,
  "education_level": "Bachelor",
  "skills": ["Python", "Machine Learning", "SQL", "TensorFlow"],
  "experience_level": "MI",
  "employment_type": "FT",
  "company_size": "L",
  "remote_ratio": 50,
  "location": "Bangalore",
  "industry": "Technology"
}

Response:
{
  "predicted_salary_lpa": 12.5,
  "salary_range": { "low": 9.8, "high": 15.2 },
  "confidence": 0.82,
  "factors": {
    "top_positive": ["has Python", "has ML", "Tier 1 city"],
    "top_negative": ["3 years experience (below senior)"]
  }
}
```

### Integration Points
1. **Job Trends Page:** New "Predict My Salary" button → auto-fills from user profile → shows prediction with breakdown
2. **Profile Page:** Sidebar widget showing "Your Estimated Market Value: ₹X-Y LPA"
3. **Job Offer Evaluator:** Compare offer salary vs. ML-predicted fair value

---

## 6. Model 2 — Resume-Job Compatibility Scorer (Embedding + Neural Ranker)

### Problem Statement
When matching a user's resume/profile to job openings, keyword matching fails to capture semantic relationships. "Python backend developer" and "Server-side engineer using Python" are essentially the same role, but keyword overlap is low. Similarly, "Machine Learning" and "Deep Learning" are strongly related skills but are treated as completely different tokens.

**Currently in our app:** Career Path Recommendation uses token overlap scoring (`set intersection` of user skills vs. job skills), enhanced with Gemini API scoring. This misses nuanced matches.

**After ML integration:** Each career recommendation shows an "ML Compatibility Score" that captures semantic understanding of how well the user's profile matches the job.

### Data Sources
| Source | What We Get | Purpose |
|--------|------------|---------|
| O\*NET API | Job descriptions, skill requirements per occupation | Create the "job side" of training pairs |
| JSearch API | Real Indian job postings with descriptions | Real-world job data for India |
| Existing CSVs | `required_skills` column for 15K jobs | Skill co-occurrence patterns |
| MongoDB Profiles | User skill/experience text | Create the "user side" of training pairs |

### Architecture

```
                    ┌─────────────────────┐
                    │  sentence-transformers │
                    │  all-MiniLM-L6-v2    │
                    │  (pre-trained, 80MB) │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
     ┌────────────┐   ┌────────────┐   ┌────────────────┐
     │ User Skills │   │ Job Desc.  │   │ Computed       │
     │ + Exp Text  │   │ + Req.     │   │ Interaction    │
     │ → 384-dim   │   │ Skills     │   │ Features       │
     │ embedding   │   │ → 384-dim  │   │                │
     │     u       │   │ embedding  │   │ |u - j|        │
     └──────┬──────┘   │     j      │   │  u * j         │
            │          └──────┬─────┘   │ cosine(u,j)    │
            │                 │         └───────┬────────┘
            └────────┬────────┘                 │
                     ▼                          │
              ┌─────────────┐                   │
              │ Concatenate │ ◄─────────────────┘
              │ [u; j;      │
              │  |u-j|;     │
              │  u*j;       │
              │  cos_sim]   │
              │ = 1153-dim  │
              └──────┬──────┘
                     ▼
              ┌─────────────┐
              │ FC: 256     │ + ReLU + Dropout(0.3)
              ├─────────────┤
              │ FC: 64      │ + ReLU + Dropout(0.2)
              ├─────────────┤
              │ FC: 1       │ + Sigmoid
              └──────┬──────┘
                     ▼
              Compatibility Score (0.0 → 1.0)
```

### Training Data Construction

Since we don't have explicit "user X matched job Y" data, we construct training pairs synthetically:

**Positive Pairs (label ≈ 0.8–1.0):**
- Take a job posting's required skills
- Create a synthetic "user" whose skills are a superset of the job requirements
- These are strong matches

**Partial Matches (label ≈ 0.3–0.7):**
- User has 40-70% of the required skills
- Label = proportion of skill overlap

**Negative Pairs (label ≈ 0.0–0.2):**
- Randomly pair a user profile with an unrelated job
- E.g., a "Web Developer" profile matched with "Mechanical Engineer" job

**From O\*NET data:**
- Each occupation has skill importance scores (1-5)
- If a user has skills rated 4.5+ importance for a job → high match
- If missing critical skills → low match

This gives us thousands of training pairs with graded relevance scores.

### Pre-trained Embedding Model
- Model: `sentence-transformers/all-MiniLM-L6-v2`
- Size: ~80MB (lightweight, runs on CPU)
- Output: 384-dimensional dense vector
- Why this model: Best balance of speed and quality for short texts (skills/descriptions)
- We do **NOT** fine-tune this model — we only train the scoring layers on top

### Training Details
```
Loss: MSE Loss (regression on compatibility score 0-1)
      OR Binary Cross-Entropy if simplified to match/no-match
Optimizer: Adam (lr=0.0005)
Epochs: 50-100 with early stopping
Batch Size: 32
5-Fold Cross Validation for robustness
```

### API Endpoint

```
POST /api/ml/match-jobs

Request Body:
{
  "user_skills": ["Python", "React", "MongoDB", "FastAPI", "Docker"],
  "user_experience": "2 years as full-stack developer",
  "user_education": "B.Tech Computer Science",
  "target_jobs": [
    {
      "job_id": "onet_15-1252",
      "title": "Software Developer",
      "description": "Design and develop software applications...",
      "required_skills": ["Python", "JavaScript", "SQL", "Git"]
    },
    {
      "job_id": "onet_15-2051",
      "title": "Data Scientist",
      "description": "Analyze data using statistical methods...",
      "required_skills": ["Python", "R", "Statistics", "ML", "SQL"]
    }
  ]
}

Response:
{
  "matches": [
    {
      "job_id": "onet_15-1252",
      "title": "Software Developer",
      "ml_compatibility_score": 0.87,
      "semantic_similarity": 0.82,
      "skill_overlap_pct": 75.0
    },
    {
      "job_id": "onet_15-2051",
      "title": "Data Scientist",
      "ml_compatibility_score": 0.45,
      "semantic_similarity": 0.51,
      "skill_overlap_pct": 40.0
    }
  ]
}
```

### Integration Points
1. **Career Path Recommendation:** Each recommended career shows the ML compatibility score alongside the existing keyword match score
2. **Career Path Recommendation:** Re-rank recommendations by ML score for better accuracy
3. **Job Offer Evaluator:** Score how well the user fits a specific job they're evaluating

---

## 7. Model 3 — Skill Recommender (Autoencoder)

### Problem Statement
When a student picks a target career and sees missing skills, the question is: **which skills should they learn first?** Skills are not independent — learning Python before learning Pandas makes more sense than the reverse. Current O\*NET data gives "importance" scores, but these don't account for:
- What the student **already knows** (prerequisites they've satisfied)
- What skills **co-occur** in real Indian job postings (market-driven ordering)
- What skills are **prerequisite** to others (dependency chain)

**Currently in our app:** The Learning Roadmap relies 100% on Gemini AI to decide skill ordering. This varies between calls and isn't grounded in job market data.

**After ML integration:** The model learns skill co-occurrence patterns from thousands of job postings. Given what a user already knows, it predicts which skills naturally "come next" in the professional development pathway.

### How Autoencoders Work for Skill Recommendation

An autoencoder is trained to **reconstruct its input**. When trained on skill vectors from job postings, it learns which skills **naturally occur together**:

```
Job posting skills: [Python=1, Pandas=1, NumPy=1, ML=1, SQL=1, Docker=0, React=0, ...]

Autoencoder learns:
- "If Python=1 AND Pandas=1, then NumPy≈1 and Scikit-learn≈1"
- "If React=1 AND JavaScript=1, then Node.js≈0.8 and CSS≈0.9"

At inference (user has Python, Pandas):
- Input: [Python=1, Pandas=1, NumPy=0, ML=0, SQL=0, ...]
- Reconstructed: [Python=0.95, Pandas=0.93, NumPy=0.88, ML=0.72, SQL=0.65, ...]
- Recommended skills = highest reconstruction values for skills the user DOESN'T have
  → NumPy (0.88), ML (0.72), SQL (0.65)
```

### Data Sources
| Source | What We Get | Purpose |
|--------|------------|---------|
| Existing CSVs | `required_skills` for 15K jobs | Skill co-occurrence vectors |
| JSearch API | Required skills from Indian job postings | India-specific co-occurrence |
| O\*NET API | Skill importance per occupation | Weight the recommendation |

### Architecture

```
Skill Vocabulary: ~200 unique normalized skills

Encoder:
  Input: 200-dim binary skill vector
  ├── Linear(200 → 128) + ReLU + Dropout(0.2)
  ├── Linear(128 → 64) + ReLU
  └── Linear(64 → 32) ← Latent Space (skill embedding)

Decoder:
  ├── Linear(32 → 64) + ReLU
  ├── Linear(64 → 128) + ReLU + Dropout(0.2)
  └── Linear(128 → 200) + Sigmoid ← Reconstructed skill probabilities

Loss: Binary Cross-Entropy (reconstruction loss)
Optimizer: Adam (lr=0.001)
Epochs: 100-200
Batch Size: 64

Optional Enhancement: Variational Autoencoder (VAE)
  - Adds KL divergence loss to regularize latent space
  - Produces smoother, more meaningful skill embeddings
  - Better for recommendation quality
```

### Inference Pipeline

```python
def recommend_skills(user_skills: List[str], target_career: str, top_k: int = 10):
    # 1. Create user's skill vector
    user_vector = encode_skills(user_skills)  # 200-dim binary
    
    # 2. Pass through autoencoder
    reconstructed = model(user_vector)  # 200-dim probabilities
    
    # 3. Get skills the user DOESN'T have, sorted by reconstruction probability
    missing_mask = (user_vector == 0)
    missing_scores = reconstructed * missing_mask
    
    # 4. Filter by target career requirements (from O*NET)
    career_skills = get_onet_career_skills(target_career)
    career_mask = encode_skills(career_skills)
    relevant_scores = missing_scores * career_mask
    
    # 5. Return top-k recommended skills
    top_indices = relevant_scores.argsort(descending=True)[:top_k]
    return [(skill_index[i], float(relevant_scores[i])) for i in top_indices]
```

### API Endpoint

```
POST /api/ml/recommend-skills

Request Body:
{
  "current_skills": ["Python", "HTML", "CSS", "JavaScript", "Git"],
  "target_career": "15-2051.00",  // Data Scientist O*NET code
  "top_k": 8
}

Response:
{
  "recommendations": [
    { "skill": "SQL", "score": 0.91, "reason": "Co-occurs with Python in 87% of Data Scientist postings" },
    { "skill": "Pandas", "score": 0.88, "reason": "Essential Python library for data manipulation" },
    { "skill": "NumPy", "score": 0.85, "reason": "Foundation for scientific computing in Python" },
    { "skill": "Machine Learning", "score": 0.79, "reason": "Core requirement for Data Scientist role" },
    { "skill": "Statistics", "score": 0.74, "reason": "60% of Indian DS postings require statistics" },
    { "skill": "Scikit-learn", "score": 0.71, "reason": "Primary ML library, pairs with Pandas/NumPy" },
    { "skill": "TensorFlow", "score": 0.62, "reason": "DL framework used in advanced DS roles" },
    { "skill": "Tableau", "score": 0.55, "reason": "Data visualization tool common in Indian market" }
  ],
  "coverage": "Learning these 8 skills would match 78% of Data Scientist requirements",
  "model_confidence": 0.84
}
```

### Integration Points
1. **Learning Roadmap:** When Gemini generates a roadmap, the skill ordering is influenced by ML recommendations
2. **Career Path Recommendation:** "Top skills to acquire" section is ML-ranked instead of static O\*NET importance
3. **Profile Page:** "Skill Gap Analysis" widget powered by ML recommendations

---

## 8. Directory Structure & New Files

```
backend/app/ml/
├── __init__.py
├── config.py                          # ML configuration (model paths, hyperparams)
│
├── data/
│   ├── raw/                           # Raw API responses (gitignored if large)
│   │   ├── onet_occupations.json
│   │   ├── jsearch_jobs_india.json
│   │   └── jsearch_salaries_india.json
│   ├── processed/                     # Cleaned training datasets
│   │   ├── salary_training_data.csv
│   │   ├── matching_pairs.csv
│   │   ├── skill_vectors.csv
│   │   └── skill_index.json           # Skill name ↔ index mapping
│   └── README.md                      # Data dictionary
│
├── models/
│   ├── __init__.py
│   ├── saved/                         # Trained model artifacts
│   │   ├── salary_model.pt
│   │   ├── salary_scaler.pkl
│   │   ├── job_matcher.pt
│   │   ├── skill_recommender.pt
│   │   ├── skill_recommender_index.json
│   │   └── model_metadata.json        # Training date, metrics, data stats
│   ├── salary_mlp.py                  # PyTorch model class definition
│   ├── job_matcher_network.py         # PyTorch model class definition
│   └── skill_autoencoder.py           # PyTorch model class definition
│
├── training/
│   ├── train_salary_model.py
│   ├── train_job_matcher.py
│   ├── train_skill_recommender.py
│   └── train_all.py                   # Runs all 3 training scripts
│
├── inference/
│   ├── __init__.py
│   ├── salary_predictor.py            # Load model + predict
│   ├── job_matcher.py                 # Load model + predict
│   ├── skill_recommender.py           # Load model + predict
│   └── ml_service.py                  # Orchestrator: loads all models, provides interface
│
├── data_collection/
│   ├── __init__.py
│   ├── onet_collector.py              # O*NET API client + data fetcher
│   ├── jsearch_collector.py           # JSearch API client + data fetcher
│   ├── data_processor.py              # Feature engineering pipeline
│   └── collect_all.py                 # Run all collection + processing
│
└── utils/
    ├── __init__.py
    ├── feature_engineering.py         # Shared feature encoding functions
    ├── text_encoder.py                # Sentence-transformer wrapper
    └── model_utils.py                 # Save/load model helpers

backend/app/routers/
└── ml_predictions.py                  # NEW: FastAPI router for ML endpoints

frontend/src/components/
└── ML Insights/                       # NEW: Frontend components for ML features
    ├── SalaryPredictor.jsx
    ├── SalaryPredictor.css
    ├── MLMatchScore.jsx               # Badge/widget for career recommendation
    └── SkillRecommendations.jsx       # Widget for learning roadmap
```

---

## 9. Tech Stack & Dependencies

### New Python Dependencies (add to `requirements.txt`)

```
# Machine Learning - Core
torch>=2.0.0                    # PyTorch for Deep Learning models
scikit-learn>=1.3.0             # Preprocessing, evaluation metrics, splits
sentence-transformers>=2.2.0    # Pre-trained text embeddings (all-MiniLM-L6-v2)

# Data Processing
pandas>=2.0.0                   # Already used
numpy>=1.24.0                   # Already used
joblib>=1.3.0                   # Model serialization

# API Clients
httpx>=0.25.0                   # Async HTTP client for API calls (or use aiohttp)
```

### Why These Specific Choices?

| Library | Why | Alternatives Considered |
|---------|-----|------------------------|
| **PyTorch** | Pythonic, lightweight, educational, industry-standard for research | TensorFlow (heavier install, more verbose) |
| **sentence-transformers** | Pre-trained NLP embeddings without fine-tuning our own model | spaCy (less semantic), gensim (Doc2Vec is weaker) |
| **scikit-learn** | Preprocessing & metrics (not for model training) | Manual implementation (unnecessary) |
| **httpx** | Async HTTP that works with FastAPI's asyncio | requests (sync only), aiohttp (more verbose) |

### Hardware Requirements
- **Training:** CPU-only, any modern laptop (i5+, 8GB RAM). Each model trains in < 5 minutes.
- **Inference:** Millisecond-level predictions on CPU. No GPU needed.
- **Storage:** Models total < 100MB. Data files < 500MB.

---

## 10. Frontend Integration Points

### 10.1 Job Trends Page — Salary Predictor Widget

**Location:** Below the existing salary chart  
**Trigger:** "Predict My Salary" button

```
┌────────────────────────────────────────────┐
│  💰 ML Salary Prediction                   │
│                                            │
│  Based on your profile:                    │
│  ┌──────────────────────────────────┐      │
│  │  Predicted Salary: ₹12.5 LPA    │      │
│  │  Range: ₹9.8 - ₹15.2 LPA       │      │
│  │  Confidence: 82%                 │      │
│  └──────────────────────────────────┘      │
│                                            │
│  Key Factors:                              │
│  ↑ Python, ML skills (+₹2.1 LPA)          │
│  ↑ Tier 1 city (Bangalore) (+₹1.5 LPA)   │
│  ↓ 3 years exp (below senior) (-₹1.8 LPA)│
│                                            │
│  Powered by ML model trained on 15K+      │
│  Indian job records                        │
└────────────────────────────────────────────┘
```

### 10.2 Career Path Recommendation — ML Match Score

**Location:** Each career card gets an additional badge  
**Display:** Alongside existing match scoring

```
┌────────────────────────────────────────────┐
│  Software Developer                        │
│  O*NET: 15-1252.00                         │
│                                            │
│  Keyword Match: 72%  │  ML Match: 87% ◄── │
│  Hot Tech: 5/8       │  Confidence: High   │
│                                            │
│  Why ML scored higher:                     │
│  "Your full-stack experience semantically  │
│   aligns with this role's requirements     │
│   beyond keyword overlap"                  │
└────────────────────────────────────────────┘
```

### 10.3 Learning Roadmap — ML Skill Recommendations

**Location:** Before or alongside Gemini-generated roadmap  
**Display:** Priority-ordered skill list with learning rationale

```
┌────────────────────────────────────────────┐
│  🎯 ML-Recommended Skills (Data Scientist) │
│                                            │
│  Based on 2,000+ Indian job postings:      │
│                                            │
│  1. SQL ████████████████████ 91%           │
│     "Co-occurs with Python in 87% of       │
│      Indian Data Science jobs"             │
│                                            │
│  2. Pandas ██████████████████ 88%          │
│     "Essential for data manipulation"      │
│                                            │
│  3. NumPy ████████████████ 85%             │
│     "Foundation for scientific computing"  │
│                                            │
│  4. Machine Learning █████████████ 79%     │
│     "Core requirement for this career"     │
│                                            │
│  [Show more...]                            │
│                                            │
│  Coverage: Learning top 8 skills matches   │
│  78% of Data Scientist requirements        │
└────────────────────────────────────────────┘
```

### 10.4 Profile Page — ML Insights Sidebar

**Location:** New sidebar widget on Profile Page

```
┌────────────────────────────────────┐
│  📊 ML-Powered Insights           │
│                                    │
│  Market Value: ₹10-14 LPA         │
│  Best Fit Role: Software Dev (87%) │
│  Skill Completeness: 65%          │
│                                    │
│  Next Skills to Learn:             │
│  → SQL (high demand in India)      │
│  → Docker (growing 23% YoY)       │
│  → AWS (top cloud skill)          │
│                                    │
│  [View Full Analysis →]            │
└────────────────────────────────────┘
```

---

## 11. Implementation Phases

### Phase 1: Data Infrastructure & API Clients (Week 1)
**Goal:** Set up the ML directory structure and build API clients

- [ ] Create the full `backend/app/ml/` directory structure
- [ ] Build `onet_collector.py` — O\*NET API client
  - Authentication (Basic Auth with username/password)
  - Fetch all tech occupations (SOC prefix `15-`, `17-`)
  - Fetch skills, knowledge, abilities, tech skills for each occupation
  - Save to `data/raw/onet_occupations.json`
  - Error handling, retry logic, logging
- [ ] Build `jsearch_collector.py` — JSearch API client
  - RapidAPI authentication headers
  - Search jobs in Indian cities (Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Pune)
  - Fetch salary estimates per role per city
  - Save to `data/raw/jsearch_jobs_india.json` and `jsearch_salaries_india.json`
  - Rate limit tracking (stay within 500 req/month)
- [ ] Build `collect_all.py` — orchestration script
- [ ] Run first data collection and validate data quality
- [ ] Update `.env` with O\*NET and JSearch credentials

**Deliverables:** Working API clients, first batch of raw data collected

### Phase 2: Data Processing & Feature Engineering (Week 2)
**Goal:** Transform raw data into training-ready datasets

- [ ] Build `data_processor.py`
  - Merge CSV data + JSearch data + O\*NET data
  - Salary normalization (USD → INR LPA conversion)
  - Outlier removal (IQR method)
  - Skill normalization (synonym mapping: "JS" → "JavaScript")
  - Feature encoding (one-hot, ordinal, binary flags)
  - Location tier classification for Indian cities
- [ ] Build `feature_engineering.py`
  - Salary model features (50 dimensions)
  - Skill vector construction (200 dimensions)
  - Text preparation for sentence embeddings
- [ ] Build `text_encoder.py`
  - Wrapper around sentence-transformers
  - Batch encoding function
  - Caching encoded vectors
- [ ] Generate processed datasets:
  - `salary_training_data.csv`
  - `matching_pairs.csv`
  - `skill_vectors.csv` + `skill_index.json`
- [ ] Write `data/README.md` documenting all fields

**Deliverables:** Clean, processed training datasets ready for modeling

### Phase 3: Model Development & Training (Week 2-3)
**Goal:** Design, train, and evaluate all 3 models

- [ ] **Model 1: Salary Predictor**
  - Implement `salary_mlp.py` (PyTorch model class)
  - Implement `train_salary_model.py`
  - Train with 70/15/15 split
  - Evaluate: MAE, RMSE, R² score
  - Hyperparameter tuning (learning rate, architecture)
  - Save model + scaler + metadata

- [ ] **Model 2: Job-Resume Matcher**
  - Implement `job_matcher_network.py` (PyTorch model class)
  - Implement `train_job_matcher.py`
  - Generate training pairs (positive/negative/partial)
  - Encode all texts with sentence-transformers
  - Train compatibility scorer
  - Evaluate: AUC-ROC, Precision@K
  - Save model + metadata

- [ ] **Model 3: Skill Recommender**
  - Implement `skill_autoencoder.py` (PyTorch model class)
  - Implement `train_skill_recommender.py`
  - Train autoencoder on skill vectors
  - Evaluate: Reconstruction error, Hit Rate@K
  - Save model + skill index + metadata

- [ ] Implement `train_all.py` (run all training)
- [ ] Document model performance in `model_metadata.json`

**Deliverables:** 3 trained model files with documented performance metrics

### Phase 4: Backend API Integration (Week 3-4)
**Goal:** Create inference services and FastAPI endpoints

- [ ] Build `inference/salary_predictor.py`
  - Load saved model + scaler at initialization
  - `predict(features_dict) → salary_prediction`
  - Feature encoding from raw user input
- [ ] Build `inference/job_matcher.py`
  - Load saved model + sentence-transformers at initialization
  - `match(user_text, job_texts) → compatibility_scores`
  - Batch prediction support
- [ ] Build `inference/skill_recommender.py`
  - Load saved model + skill index at initialization
  - `recommend(current_skills, target_career) → ranked_skills`
  - Filter by career requirements
- [ ] Build `inference/ml_service.py`
  - Singleton service that loads all 3 models
  - Lazy loading (models loaded on first request)
  - Health check: are models loaded and valid?
- [ ] Build `routers/ml_predictions.py`
  - `POST /api/ml/predict-salary`
  - `POST /api/ml/match-jobs`
  - `POST /api/ml/recommend-skills`
  - `GET /api/ml/model-info` (metadata: training date, accuracy, data size)
  - `GET /api/ml/health` (are models loaded?)
- [ ] Register router in `main.py`
- [ ] Test all endpoints with Postman/curl

**Deliverables:** Working ML API endpoints serving predictions

### Phase 5: Frontend Integration (Week 4)
**Goal:** Build React components that consume ML API endpoints

- [ ] Build `SalaryPredictor.jsx` component
  - Form with auto-fill from user profile
  - API call to `/api/ml/predict-salary`
  - Display predicted salary with range and factors
  - Integrate into Job Trends page
- [ ] Build `MLMatchScore.jsx` component
  - Badge/widget showing ML compatibility score
  - Integrate into each career recommendation card
  - Side-by-side display with existing keyword score
- [ ] Build `SkillRecommendations.jsx` component
  - List of recommended skills with scores and reasons
  - Integrate into Learning Roadmap page
  - Also add to Career Path Recommendation page
- [ ] Add ML insights widget to Profile Page
- [ ] Loading states, error handling, fallbacks (graceful degradation if model not available)
- [ ] Styling consistent with existing UI

**Deliverables:** ML features visible and functional in the frontend

### Phase 6: Testing, Documentation & Demo Preparation (Week 5)
**Goal:** Polish, test, and prepare for presentation

- [ ] End-to-end testing: data collection → training → serving → frontend
- [ ] Edge case testing (empty profiles, unknown skills, missing data)
- [ ] Performance testing (latency of predictions)
- [ ] Retraining demonstration (collect new data → retrain → improved predictions)
- [ ] Documentation:
  - Update project README
  - ML model documentation (architecture, data, metrics)
  - Retraining guide
  - API documentation (Swagger/OpenAPI is auto-generated by FastAPI)
- [ ] Prepare demo flow:
  1. Show data collection from APIs
  2. Show model training (live or recorded)
  3. Demo salary prediction with student profile
  4. Demo career matching with ML score
  5. Demo skill recommendations

**Deliverables:** Fully tested, documented ML integration ready for demo

---

## 12. Retraining Pipeline

The retraining pipeline is designed to be **dead simple** — just run scripts:

```bash
# From project root directory:

# Step 1: Collect fresh data from APIs
python -m backend.app.ml.data_collection.collect_all
# This fetches latest data from O*NET and JSearch (Indian jobs)
# Takes ~5-10 minutes depending on API response times
# Uses ~120-150 JSearch API calls (within free tier monthly limit)

# Step 2: Process data and create training datasets
python -m backend.app.ml.data_collection.data_processor
# Merges new API data with existing CSV data
# Cleans, normalizes, engineers features
# Outputs processed CSVs in data/processed/
# Takes ~1-2 minutes

# Step 3: Train all models
python -m backend.app.ml.training.train_all
# Trains all 3 models sequentially
# Saves new model files to models/saved/
# Prints evaluation metrics
# Takes ~3-5 minutes on CPU

# Or train individually:
python -m backend.app.ml.training.train_salary_model
python -m backend.app.ml.training.train_job_matcher
python -m backend.app.ml.training.train_skill_recommender

# Step 4: Restart the FastAPI server to load new models
# (or implement hot-reloading in ml_service.py)
```

### When to Retrain?
| Trigger | Action |
|---------|--------|
| Monthly | Run full pipeline to incorporate new job postings |
| New CSV data added | Run data_processor + train_all |
| Model performance drops | Investigate data quality, retrain |
| New skills emerge | Update skill index, retrain skill recommender |
| Before a demo | Run data collection for freshest data, then retrain |

### Data Versioning
- Each collection run saves data with timestamp in filename
- Old data is NOT deleted — new data is merged with historical data
- More data over time = better models
- `model_metadata.json` tracks which data version was used for training

---

## 13. Evaluation Metrics & Success Criteria

### Model 1: Salary Predictor

| Metric | Target | What It Means |
|--------|--------|--------------|
| **MAE** (Mean Absolute Error) | < ₹2.5 LPA | Average prediction error within ₹2.5 lakhs |
| **RMSE** (Root Mean Squared Error) | < ₹3.5 LPA | Penalizes large errors more than MAE |
| **R² Score** | > 0.65 | Model explains 65%+ of salary variance |
| **MAPE** (Mean Absolute % Error) | < 25% | Predictions within 25% of actual salary |

### Model 2: Job-Resume Matcher

| Metric | Target | What It Means |
|--------|--------|--------------|
| **AUC-ROC** | > 0.80 | Good discrimination between match/non-match |
| **Precision@5** | > 0.70 | 7 out of 10 top-5 recommendations are relevant |
| **Spearman Correlation** | > 0.60 | ML score correlates with actual skill overlap |
| **Latency** | < 500ms | Scoring 10 jobs takes under 0.5 seconds |

### Model 3: Skill Recommender

| Metric | Target | What It Means |
|--------|--------|--------------|
| **Reconstruction Loss** | < 0.15 | Autoencoder accurately models skill patterns |
| **Hit Rate@10** | > 0.60 | 6+ of top 10 recommended skills are actual requirements |
| **NDCG@10** | > 0.50 | Recommended skill ordering matches importance ordering |
| **Coverage** | > 80% | Model can recommend for 80%+ of career paths |

### Overall System Success Criteria
- [ ] All 3 models trained and serving predictions
- [ ] End-to-end latency < 2 seconds for any prediction
- [ ] Graceful fallback when model is unavailable (show keyword-based results)
- [ ] Retraining pipeline works end-to-end
- [ ] Frontend displays ML predictions alongside existing features
- [ ] Can demo the full flow to teachers in under 10 minutes

---

## 14. How to Explain to Teachers

### The "Elevator Pitch"
> "Our career guidance platform already uses AI (Gemini) for generating advice, but it lacks **data-driven predictions**. We added 3 Deep Learning models trained on real Indian job market data from O\*NET and JSearch APIs. A Neural Network predicts personalized salaries, a Sentence Embedding model semantically matches resumes to careers, and an Autoencoder recommends which skills to learn next — all based on patterns found in 15,000+ job postings."

### Model-by-Model Justification

#### Model 1: Salary Predictor
- **Teacher Question:** "Why not just show the average salary?"
- **Answer:** "Average salary doesn't account for a specific user's skills, experience, or location. A student with Python + ML + 3 years experience in Bangalore will earn very differently than someone with HTML + 0 years in a Tier-3 city. Our neural network captures these non-linear interactions between 50+ features to give a personalized prediction."
- **DL Justification:** "We use a Multi-Layer Perceptron with BatchNorm, Dropout, and Huber Loss. The non-linear activation functions (ReLU) allow the network to model complex relationships like 'ML skills boost salary exponentially in Tier-1 cities but have less impact in non-tech industries.'"

#### Model 2: Job-Resume Matcher
- **Teacher Question:** "Why not use keyword matching?"
- **Answer:** "Keyword matching misses semantic relationships. 'Python backend developer' and 'Server-side engineer using Python' have low keyword overlap but mean the same thing. Our model uses sentence-transformers (a pre-trained Deep Learning model) to create 384-dimensional embeddings that capture meaning, not just words. Then a neural scoring network learns what constitutes a good match."
- **DL Justification:** "We use a pre-trained transformer model (all-MiniLM-L6-v2) for text encoding — this is based on BERT architecture with 6 transformer layers and attention mechanisms. The scoring layers on top are trained on our data."

#### Model 3: Skill Recommender
- **Teacher Question:** "Why not just recommend the most popular skills?"
- **Answer:** "Most popular skills might not be relevant to a specific career path. Our autoencoder learns which skills naturally co-occur in real job postings. It understands that if you know Python and Pandas, you should learn NumPy next (because these co-occur in 90% of Data Science jobs) rather than React (which co-occurs in Web Development jobs). It's context-aware recommendation."
- **DL Justification:** "The autoencoder is an unsupervised Deep Learning model that compresses skill vectors through a bottleneck layer (200→128→64→32→64→128→200). The compressed latent space learns a meaningful 'skill embedding' where similar skill sets are close together. This is analogous to how word2vec learns word embeddings."

### Architecture Talking Points
1. **Data Pipeline:** "We built a complete ML pipeline — data collection from live APIs → cleaning & feature engineering → model training → model serving via FastAPI → React UI display."
2. **Dynamic Data:** "Unlike static datasets, our models can be retrained whenever we collect new data from APIs. The pipeline is designed for easy retraining."
3. **India Focus:** "All job data is specifically collected for Indian cities and the Indian job market, making predictions relevant to our users."
4. **No Cloud Required:** "All models run locally on CPU. Training takes <5 minutes. No cloud GPU or deployment platform needed."
5. **Graceful Degradation:** "If ML models aren't available, the app falls back to the existing keyword-based approach. ML enhances but doesn't break existing features."

---

## Appendix A: API Request Budget (JSearch Free Tier)

Monthly budget: 500 requests

| Collection | Requests Used | Purpose |
|-----------|--------------|---------|
| Job search (10 roles × 6 cities × 2 pages) | 120 | Indian job postings |
| Salary estimates (10 roles × 6 cities) | 60 | Salary data per city |
| Job details (30 top results) | 30 | Detailed descriptions |
| **Total per collection run** | **~210** | |
| **Runs per month** | **2** | Stay within 500 limit |
| **Leftover for ad-hoc queries** | **~80** | Buffer for testing/debugging |

## Appendix B: Indian City Tier Classification

| Tier | Cities | Characteristics |
|------|--------|----------------|
| **Tier 1** | Bangalore, Mumbai, Delhi NCR, Hyderabad | Major tech hubs, highest salaries |
| **Tier 2** | Chennai, Pune, Kolkata, Ahmedabad, Noida, Gurgaon | Growing tech presence, moderate salaries |
| **Tier 3** | Jaipur, Lucknow, Chandigarh, Indore, Coimbatore, Kochi | Emerging tech cities |

## Appendix C: Skill Normalization Map (Sample)

```json
{
  "js": "javascript",
  "ts": "typescript",
  "py": "python",
  "ml": "machine learning",
  "dl": "deep learning",
  "ai": "artificial intelligence",
  "nlp": "natural language processing",
  "cv": "computer vision",
  "k8s": "kubernetes",
  "aws": "amazon web services",
  "gcp": "google cloud platform",
  "sql server": "sql",
  "postgres": "postgresql",
  "mongo": "mongodb",
  "react.js": "react",
  "reactjs": "react",
  "node.js": "nodejs",
  "express.js": "expressjs",
  "vue.js": "vue",
  "angular.js": "angular",
  "sci-kit learn": "scikit-learn",
  "sklearn": "scikit-learn",
  "tf": "tensorflow"
}
```

---

*This roadmap is a living document. Update it as you progress through implementation.*
