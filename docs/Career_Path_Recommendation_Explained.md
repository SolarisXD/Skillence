# Career Path Recommendation — Technical Deep Dive

## 1. Executive Summary

The Career Path Recommendation page is the core intelligence feature of Skillence. It analyzes a user's resume-parsed profile, matches their skills against **894 real occupations** from the U.S. Department of Labor's O\*NET database using a **custom-trained ML model**, ranks the top matches using **Google Gemini AI**, and generates a **personalized learning roadmap** with skill gap analysis, phased learning plans, and curated resources. The entire pipeline — from data collection to model training to real-time inference — is built from scratch.

---

## 2. User Journey (Step by Step)

| Step | Action | What Happens Behind the Scenes |
|------|--------|-------------------------------|
| 1 | User navigates to Career Path Recommendation | Page loads; if a career was previously saved, the saved learning plan is restored from MongoDB |
| 2 | Clicks **"Analyze My Profile"** | Frontend sends POST `/api/career-path/recommendations` with JWT auth |
| 3 | System processes | ML pre-filter runs dot product across 894 occupations (~1 ms) → top 30 sent to Gemini → top 10 ranked with scores and explanations |
| 4 | Results displayed | Cards showing rank, career title, compatibility %, explanation, matched technologies |
| 5 | User selects a career | POST `/api/career-path/save-career-path` saves selection to MongoDB profile |
| 6 | Learning plan auto-generates | GET `/api/career-path/learning-plan` → ML recommender + O\*NET data + Gemini AI → 3-phase roadmap |
| 7 | Plan displayed | Skill Gap Analysis (priority skills, strengths) + 3-Phase Learning Roadmap (skills, resources with URLs, milestones) |
| 8 | User interacts | Can add recommended skills to profile, collapse/expand phases, view resources, regenerate plan |
| 9 | On next visit | Saved learning plan restored from `career_path.saved_learning_plan` in MongoDB — no re-generation needed |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                   │
│  CareerPathRecommendation.jsx                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Analyze Prof.│  │ Career Cards │  │ Learning Plan Display    │  │
│  │   Button     │→ │ (Top 10)     │→ │ Skills + Roadmap + Res.  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ REST API (JWT Auth)
┌───────────────────────────────▼──────────────────────────────────────┐
│                      BACKEND (FastAPI + Python)                      │
│                                                                      │
│  ┌───────────────────────┐  ┌──────────────────────────────────┐    │
│  │ CareerRecommendation  │  │ LearningPlanService              │    │
│  │ Service (Singleton)   │  │                                  │    │
│  │                       │  │  O*NET Data Extraction           │    │
│  │  1. Skill Extraction  │  │  ML Skill Recommender            │    │
│  │  2. ML Pre-Filter     │  │  Gemini Plan Generation          │    │
│  │  3. Gemini Ranking    │  │  Priority Skill Merging          │    │
│  │  4. Tech Enrichment   │  │  Skill Gap Analysis              │    │
│  └───────────┬───────────┘  └──────────────┬───────────────────┘    │
│              │                              │                        │
│  ┌───────────▼───────────┐  ┌──────────────▼───────────────────┐    │
│  │  ML Model (NumPy)     │  │  Gemini 2.5 Flash API            │    │
│  │  Skill Autoencoder    │  │  + O*NET Excel/JSON Data          │    │
│  │  692-dim vectors      │  │  + Azure AI (resume parsing)      │    │
│  └───────────────────────┘  └──────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    MongoDB Atlas (Async)                      │    │
│  │  profiles collection: user_id, profile_data, career_path,    │    │
│  │                       career_path.saved_learning_plan         │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router |
| Backend | FastAPI (Python 3.10), Uvicorn |
| Database | MongoDB Atlas (async via Motor) |
| ML Training | PyTorch, NumPy, Pandas |
| ML Inference | Pure NumPy (no PyTorch at runtime) |
| AI | Google Gemini 2.5 Flash |
| Resume Parsing | Azure AI Document Intelligence |
| Data Sources | O\*NET Database, O\*NET REST API, JSearch API (RapidAPI) |

---

## 4. Data Sources & Collection

### 4.1 O\*NET Database (U.S. Department of Labor)

O\*NET (Occupational Information Network) is the **primary source of occupational data** in the United States. It is maintained by the Department of Labor and updated quarterly.

**Files used:**
- **Technology Skills.xlsx** — Every technology/tool used by each occupation, with a `Hot Technology` flag marking in-demand technologies (e.g., Python is flagged as hot for Software Developers)
- **Skills.xlsx** — Core professional skills (e.g., "Programming", "Systems Analysis") with importance ratings (1–5 scale) per occupation
- **Knowledge.xlsx** — Knowledge areas (e.g., "Computers and Electronics", "Mathematics") with importance ratings per occupation
- **onet_occupations_data.json** — 894 occupation codes, titles, required/optional skill lists

**Why O\*NET?** It is the gold standard for occupational data — used by the Bureau of Labor Statistics, universities, and government agencies. Unlike scraped job postings, O\*NET data is **validated by occupational analysts** and covers the full spectrum of careers (not just tech).

### 4.2 O\*NET REST API (Live Enrichment)

Beyond the static Excel files, we use the O\*NET REST API to fetch **additional technology skills** for each occupation that may not be in the Excel snapshots.

**Process (`fetch_api_data.py`):**
1. Fetch the full occupation list (paginated, ~894 occupations)
2. For each occupation, fetch detailed technology skills with hot/in-demand flags
3. Cache results locally (resumable — interrupted runs pick up where they left off)
4. Rate-limited with retry logic (0.4s delay between requests)

### 4.3 JSearch API (Real Job Postings)

JSearch (via RapidAPI) provides **real-world job postings** to supplement the academic O\*NET data with current market signals.

**Process:**
1. Query 20 diverse role types: "data scientist", "full stack developer", "DevOps engineer", "machine learning engineer", etc.
2. Extract technology requirements from job descriptions using regex pattern matching (150+ technology keywords)
3. Map job titles to O\*NET occupation codes via SOC crosswalk
4. Result: Real skill associations from actual employer requirements

### 4.4 AI Job Dataset

A supplementary CSV (`ai_job_dataset.csv`) with job postings containing `required_skills` fields. Each row's skills are split and mapped into the unified vocabulary.

### 4.5 Data Statistics

| Metric | Value |
|--------|-------|
| Total training samples | **17,375** |
| Skill vocabulary size | **692** unique skills |
| O\*NET occupations covered | **894** |
| Data sources merged | **7** (3 Excel, 1 JSON, 1 CSV, O\*NET API, JSearch API) |
| Hot/in-demand technologies tracked | varies per occupation |
| JSearch query categories | **20** diverse tech roles |
| Skill aliases defined | **30+** (e.g., "js" → "javascript") |

---

## 5. The ML Model — Skill Recommender Autoencoder

### 5.1 Problem Formulation

> **Given a user's current skills, what other skills should they learn for a target career?**

This is NOT a classification problem (yes/no) or regression problem (predict a number). It is a **recommendation problem** — specifically, a **skill co-occurrence learning** problem. We need a model that understands: *"If someone knows React and Node.js, they probably also need JavaScript, CSS, MongoDB, and Git."*

### 5.2 Why an Autoencoder?

An autoencoder is a neural network that learns to **compress** input data into a small latent representation and then **reconstruct** it back. The key insight:

1. **Input**: A partial skill vector (what the user knows)
2. **Latent Space**: A 32-dimensional compressed "career DNA"
3. **Output**: A reconstructed FULL skill vector (what a complete professional in that space should know)
4. **Recommendation**: The gap between input and output = skills to learn

**Why not other models?**

| Model | Why Not |
|-------|---------|
| Collaborative Filtering / SVD | Assumes linear relationships; can't capture complex multi-skill interactions |
| Graph Neural Networks (GNN) | Requires explicit graph construction; overkill for 692 features |
| Simple Cosine Similarity | No learning — just compares vectors directly; misses latent patterns |
| Transformer / LLM | Massive overkill for binary vectors; designed for sequential data |
| K-Nearest Neighbors | Just finds similar profiles; doesn't understand WHY skills co-occur |
| Random Forest / XGBoost | Classification models; not designed for reconstruction/recommendation |

The autoencoder's non-linear activations (LeakyReLU) capture complex interaction effects that linear models miss — for example, knowing "React" + "MongoDB" together might strongly predict "Node.js", but neither alone would.

### 5.3 Architecture

```
ENCODER:
  Input (692) → Linear(256) → BatchNorm → LeakyReLU(0.2) → Dropout(0.3)
             → Linear(128) → BatchNorm → LeakyReLU(0.2) → Dropout(0.3)
             → Linear(64)  → BatchNorm → LeakyReLU(0.2) → Dropout(0.15)
             → Linear(32)  → Latent Space

DECODER:
  Latent (32) → Linear(64)  → BatchNorm → LeakyReLU(0.2) → Dropout(0.15)
              → Linear(128) → BatchNorm → LeakyReLU(0.2) → Dropout(0.3)
              → Linear(256) → BatchNorm → LeakyReLU(0.2) → Dropout(0.3)
              → Linear(692) → Sigmoid → Output
```

**Key design choices:**
- **BatchNorm** after every linear layer: stabilizes training, allows higher learning rates
- **LeakyReLU(0.2)**: prevents "dying neurons" (unlike standard ReLU which zeroes out negative values permanently)
- **Dropout**: regularization to prevent overfitting (0.3 in wider layers, 0.15 near the bottleneck)
- **Sigmoid output**: maps to [0, 1] since inputs are binary — output values represent reconstruction confidence
- **Xavier initialization**: ensures gradients don't explode or vanish at the start of training
- **32-dim bottleneck**: forces the model to learn a compressed representation; similar careers cluster together in this 32-dim space

### 5.4 Denoising Mechanism

A standard autoencoder might just memorize inputs (identity mapping). The **denoising** variant prevents this:

1. During training, **30% of input skills are randomly zeroed out** (corruption)
2. The model must reconstruct the **original, uncorrupted** vector
3. This forces the model to learn **robust co-occurrence patterns** rather than memorizing individual inputs

**Example:** If a training sample has `[React=1, JavaScript=1, CSS=1, Node.js=1]` and the denoiser zeros out JavaScript, the model must still reconstruct `JavaScript=1` — learning that React, CSS, and Node.js together strongly imply JavaScript.

```python
class DenoisingWrapper:
    def corrupt(self, x):
        mask = torch.bernoulli(torch.full_like(x, 0.7))  # keep 70%, zero 30%
        return x * mask
```

### 5.5 Training Pipeline

```
skill_data_processor.py          train_skill_recommender.py         export_to_numpy.py
┌─────────────────┐              ┌─────────────────────┐           ┌──────────────────┐
│ Load 7 sources  │              │ Load processed data │           │ Load .pt ckpt    │
│ Build 692 vocab │  ────────►   │ 85/15 train/val     │  ──────►  │ Extract weights  │
│ Build 17375×692 │  artefacts   │ Denoising AE train  │  ckpt    │ Save .npz        │
│ Save .npy/.json │              │ Early stopping      │           │ (NumPy-only)     │
└─────────────────┘              └─────────────────────┘           └──────────────────┘
```

**Training hyperparameters:**

| Parameter | Value | Reason |
|-----------|-------|--------|
| Latent dimension | 32 | Enough to capture career patterns; small enough to generalize |
| Dropout rate | 0.3 | Prevents overfitting on 17K samples |
| Corruption rate | 0.3 | Aggressive enough to force pattern learning |
| Learning rate | 1e-3 | Standard for Adam optimizer |
| Weight decay | 1e-5 | L2 regularization for smoother weights |
| Batch size | 128 | Balances training speed and gradient stability |
| Max epochs | 200 | Upper bound; early stopping triggers sooner |
| Early stopping patience | 20 | Stops when validation loss plateaus for 20 epochs |
| Validation split | 15% | Enough for reliable loss monitoring |
| Loss function | Binary Cross-Entropy | Standard for binary reconstruction targets |
| LR scheduler | ReduceLROnPlateau | Halves LR after 8 epochs of no improvement |

### 5.6 NumPy Inference (Why No PyTorch at Runtime)

**Problem:** Loading PyTorch inside the FastAPI process on Windows causes `c10.dll` / `[WinError 1114]` crashes due to DLL initialization conflicts.

**Solution:** Export the trained model's weights to a NumPy `.npz` file and reproduce the forward pass with pure NumPy operations:

```python
def _linear(x, weight, bias):      return x @ weight.T + bias
def _batchnorm(x, mean, var, w, b): return w * (x - mean) / np.sqrt(var + 1e-5) + b
def _leaky_relu(x, slope=0.2):     return np.where(x > 0, x, slope * x)
def _sigmoid(x):                    return 1.0 / (1.0 + np.exp(-np.clip(x, -500, 500)))
```

**Benefits:**
- Zero dependency on PyTorch at runtime
- Faster cold start (no CUDA/c10 initialization)
- Identical output to PyTorch (verified)
- Portable across environments

---

## 6. Career Recommendation Pipeline

When the user clicks "Analyze My Profile", a 3-stage pipeline executes:

### 6.1 Stage 1: ML Pre-Filter (~1 ms)

```
User Profile → Extract Skills → Map to 692-dim Vector → Dot Product vs 894 Profiles → Top 30
```

1. **Skill Extraction**: Pull skills from `profile_data.skills.technical`, project technologies, certifications, work experience technologies
2. **Vector Mapping**: Each skill mapped to the 692-dim vocabulary using:
   - **Exact match**: `"python"` → index 423
   - **Alias match**: `"js"` → `"javascript"` → index 287 (30+ aliases: k8s→kubernetes, ts→typescript, etc.)
   - **Fuzzy match**: For skills ≥ 4 chars, regex word-boundary search (e.g., `"aws"` matches `"amazon web services aws software"`)
3. **Dot Product**: `scores = occupation_profiles @ user_vector` — counts shared skills with each of 894 occupations
4. **Pre-selection**: Top 30 by score

**Why dot product?** For binary vectors, the dot product equals the count of shared skills. It is **O(N × V)** — for 894 × 692, this completes in ~1 millisecond. No model inference needed.

**How are occupation profiles built?** During data loading, for each occupation code, all training vectors belonging to that occupation are averaged and then binarized (threshold > 0.5). This creates a single representative profile per occupation.

### 6.2 Stage 2: Gemini AI Ranking

```
Top 30 Candidates + User Profile → Gemini 2.5 Flash → Top 10 with Scores + Explanations
```

The ML pre-filter finds **quantitative** matches, but it can't judge **qualitative** fit. Example: a pre-filter might rank both "Software Developer" and "Elementary School Teacher" highly for someone with Python skills (teachers use Python in some curricula). Gemini understands context.

**Prompt structure:**
```
SKILLS: react, javascript, python, mongodb, node.js, docker, aws...
PROFILE: Technical Skills: React, Node.js. Education: B.S. Computer Science.
         Key Projects: E-commerce Platform, Chat App. Experience: Junior Dev at TechCo.

OCCUPATIONS:
1. Software Developers (15-1252.00) [skill overlap: 12]
2. Data Scientists (15-2051.00) [skill overlap: 8]
...30 candidates...

Return JSON: [{"code":"15-1252.00","score":0.95,"explanation":"..."}]
```

**Configuration:** Temperature 0.1 (near-deterministic), maxOutputTokens 8192

**Fallback:** If Gemini fails, scores are computed deterministically from the pre-filter: `score = 0.50 + 0.45 × (shared / max_shared)`

### 6.3 Stage 3: Result Enrichment

Each ranked occupation is enriched with:
- **Hot Technology Matches**: Which of the user's skills are flagged as hot/in-demand for that career
- **Regular Technology Matches**: Other matched technologies
- **O\*NET Hot Technologies**: Technologies in demand for that role (even if the user doesn't have them yet)

### 6.4 Why This 3-Stage Approach?

| Approach | Issues |
|----------|--------|
| **Gemini alone for all 894** | Context window can't hold 894 occupations; expensive; slow (45+ seconds); hallucination risk |
| **ML alone (no AI)** | Good at recall but poor at precision; can't understand career context beyond skill overlap |
| **Rule-based matching** | Too rigid; misses nuanced career fits; no learning from data |
| **Our hybrid (ML + AI)** | ML handles **scale** (894 → 30 in 1 ms); AI handles **nuance** (context-aware ranking in ~3 sec) |

The hybrid approach is **faster** (1 ms ML + 3 sec AI vs 45+ sec pure AI), **cheaper** (1 Gemini call vs 894), and **more accurate** (deterministic pre-filter + intelligent ranking).

---

## 7. Learning Plan Generation

After the user selects a career, the system generates a personalized learning plan.

### 7.1 Skill Gap Analysis

The `LearningPlanService` compares the user's skills against the career's requirements:

1. **Extract career requirements** from O\*NET data:
   - Core skills with importance ≥ 4.0 (out of 5)
   - Technical skills (all technologies for that occupation)
   - Hot technologies (in-demand, flagged by industry analysts)
   - Knowledge areas with importance ≥ 4.0

2. **Match against user's skills** using:
   - Direct matching
   - Synonym detection (e.g., "javascript" ↔ "js", "machine learning" ↔ "ml")
   - Partial word matching for compound terms

3. **Smart filtering**: If the user already covers ≥ 70% of requirements, only show the top 3 high-priority gaps (don't overwhelm with minor gaps)

4. **Output**: Missing skills, missing hot technologies, skill level gaps, and current strengths

### 7.2 ML Skill Recommendations

The trained autoencoder provides **data-driven skill suggestions**:

1. User's current skills → 692-dim binary vector
2. Autoencoder forward pass → reconstructed vector (all 692 dimensions)
3. If a target occupation is specified, add a **50% boost** for skills in that career's profile
4. Rank skills by reconstruction confidence (excluding skills the user already knows)
5. Filter out generic/non-actionable skills ("mathematics", "communication", "active listening")
6. Return top 15–20 recommendations with confidence scores and source labels

### 7.3 Gemini AI Roadmap Generation

Everything is sent to Gemini to create a structured learning plan:

**Input to Gemini:**
- User's current technical and soft skills
- Years of experience
- Career title
- O\*NET requirements (core skills, hot tech, knowledge areas)
- ML-recommended skills (from autoencoder)

**Gemini generates:**
- **3-phase roadmap**: Foundation → Technical Development → Specialization
- Each phase includes:
  - Skills to focus on
  - Learning resources (title, provider, duration, type, URL)
  - Hands-on projects
  - Milestones to achieve
- Overall timeline and weekly commitment estimate
- AI-generated descriptions for each priority skill (why it matters for the role)

### 7.4 Priority Skills Merging

The final priority skills list is a **unified merge** of three sources:

1. **Gemini-identified gaps** (from the AI analysis)
2. **O\*NET hot technologies** (industry-validated demand signals)
3. **ML autoencoder recommendations** (data-driven co-occurrence patterns)

**Merging rules:**
- Deduplicate by skill name (case-insensitive)
- Filter out the user's known skills
- Filter out generic skills (30+ entries like "mathematics", "communication", "time management")
- Assign priority: **Critical** (hot tech) → **High** (ML confidence ≥ 0.15) → **Medium** (others)
- Sort by priority, then by confidence score descending
- Cap at 12 items to avoid overwhelming the user
- Each skill gets an AI-generated reason (e.g., "Essential for building scalable microservices")

---

## 8. What Makes This Unique

### 8.1 vs. ChatGPT / Gemini Alone

| Aspect | ChatGPT/Gemini Alone | Skillence |
|--------|---------------------|-----------|
| Data source | Training data (potentially outdated) | Live O\*NET data (updated quarterly) + real job postings |
| Personalization | Based on conversation context only | Based on actual resume data (Azure AI parsed) |
| Career matching | Hallucinates careers; no quantitative basis | 894 verified occupations; dot product scoring |
| Consistency | Different answer each time | ML pre-filter is deterministic; AI ranking uses temperature 0.1 |
| Skill recommendations | Generic suggestions | Autoencoder trained on 17,375 real skill patterns |
| Scalability | Can't process 894 occupations in one prompt | ML handles 894 in 1 ms; AI only processes 30 |
| State persistence | Conversation-only; lost on refresh | MongoDB — career path, learning plan, progress saved |
| Accountability | No traceable data lineage | Every recommendation backed by O\*NET codes, ML confidence scores |

### 8.2 vs. Existing Career Platforms

| Platform | Approach | Limitation |
|----------|----------|-----------|
| LinkedIn | Shows job listings | Doesn't analyze YOUR skills vs occupation requirements |
| Indeed | Keyword search | No personalized career matching or learning plans |
| Career counseling | Manual assessment | Expensive, time-consuming, not data-driven |
| Coursera/Udemy | Course recommendations | Recommends courses, not career paths |
| MyNextMove (O\*NET site) | Interest-based questionnaire | Generic; doesn't use resume data; no ML |

**Skillence combines** resume analysis + ML skill matching + AI reasoning + government occupational data + personalized learning roadmaps — no other tool does all of these together.

### 8.3 Key Innovations

1. **Hybrid ML + AI Pipeline**: ML for speed and scale, AI for reasoning and context — the best of both worlds
2. **Denoising Autoencoder for Skills**: Novel application of denoising autoencoders to the career recommendation domain
3. **Multi-Source Data Fusion**: 7 data sources (3 Excel, 1 JSON, 1 CSV, 2 APIs) merged into a unified 692-dim vocabulary
4. **NumPy-Only Inference**: PyTorch-trained model deployed without PyTorch at runtime — zero heavy dependencies
5. **3-Source Priority Merging**: AI-identified + industry-validated + ML-recommended skills in one unified list
6. **Resume-Driven Personalization**: Not questionnaire-based — uses actual parsed resume data for matching

---

## 9. Technical Decisions & Trade-offs

### 9.1 Why Autoencoder Over Other Models?

The core requirement is: *"Given partial skills, predict what the complete skill set should look like."* This is a **reconstruction** / **completion** problem, not classification or regression.

- **Autoencoders** are designed exactly for this — they learn compressed representations and reconstruct
- **Denoising** variant ensures the model learns patterns, not memorization
- **Non-linear** activations capture complex skill interactions (React + MongoDB → Node.js)
- The 32-dim latent space is a useful byproduct — it can be used for career similarity searches

### 9.2 Why Binary Vectors?

Skills are inherently binary — you either know Python or you don't. There's no meaningful "0.7 Python".

- Binary vectors are fast for dot product operations (~1 ms for 894 occupations)
- Memory efficient (17,375 × 692 matrix is ~48 MB)
- Clean signal for the autoencoder (no noisy continuous values)
- Importance/proficiency levels are handled separately in the Gemini ranking step

### 9.3 Why Gemini 2.5 Flash?

| Factor | Gemini 2.5 Flash |
|--------|-----------------|
| Latency | Fast (~2-4 seconds for ranking) |
| Cost | Low per-token cost |
| JSON output | Reliable structured output |
| Reasoning | Strong enough for career context judgment |
| Token limit | Large enough for 30 candidates + profile |

Temperature is set to 0.1 (near-deterministic) because career recommendations should be consistent — the same profile should get similar recommendations each time.

### 9.4 Why NumPy Inference?

PyTorch's C++ runtime (`c10.dll`) causes conflicts with FastAPI's async event loop on Windows. Rather than add complex workarounds (subprocesses, Docker isolation), we:

1. Train with PyTorch in a separate script
2. Export all weights (Linear layers, BatchNorm parameters) to a `.npz` file
3. Reproduce the forward pass with 4 NumPy functions (linear, batchnorm, leaky_relu, sigmoid)
4. Result: Identical output, zero PyTorch dependency at runtime, instant cold starts

---

## 10. Frequently Asked Questions

### Q: How is the model trained?
**A:** The Skill Recommender Autoencoder is trained on 17,375 binary skill vectors (692 features each). Each vector represents one occupation or job posting's skill requirements. Training uses denoising (30% input corruption), Binary Cross-Entropy loss, Adam optimizer with weight decay, learning rate scheduling, and early stopping with 20 epochs patience. The model trains on 85% of data and validates on 15%.

### Q: Where does the training data come from?
**A:** Seven sources merged by the `SkillDataProcessor`:
1. O\*NET Technology Skills (Excel) — hot/in-demand technologies per occupation
2. O\*NET Skills (Excel) — core professional skills with importance ratings
3. O\*NET Knowledge (Excel) — knowledge areas with importance ratings
4. O\*NET occupations JSON — codes, titles, required/optional skills
5. AI Job Dataset (CSV) — job postings with required skills
6. O\*NET REST API — live-fetched technology skills (resumable fetcher)
7. JSearch API — real job postings from 20 tech role queries

### Q: What is the latent space?
**A:** The 32-dimensional latent space is a compressed representation of "career DNA." When a user's skills are encoded into this space, the decoder reconstructs a full 692-dim skill vector. Skills with high reconstruction confidence that the user doesn't already know become recommendations. Similar careers cluster in this space — embedded representations can also be used for career similarity searches.

### Q: How do you handle users with very few skills?
**A:** Even a student with 3–4 skills gets meaningful recommendations because:
1. The autoencoder learned co-occurrence patterns from 17,375 training samples
2. O\*NET provides ground truth for what each career needs (independent of the user)
3. The Gemini ranking adds context-aware judgment beyond pure skill overlap
4. The 50% career boost in the recommender ensures target-relevant skills are surfaced

### Q: What is the accuracy of the model?
**A:** "Accuracy" isn't the right metric for a recommendation system. Instead, quality is evaluated by:
1. **Relevance**: Do recommended careers make contextual sense? (ML pre-filter + Gemini validation ensures yes)
2. **Precision**: Are irrelevant careers filtered out? (Gemini explicitly removes mismatches like "teaching roles for a tech candidate")
3. **Usefulness**: Are recommended skills actionable? (Generic skills like "mathematics" are filtered out; only specific technologies remain)
4. **Consistency**: Same input → same output? (ML is deterministic; Gemini at temperature 0.1 is near-deterministic)

### Q: Why not just use a pre-trained language model (BERT, GPT) for skill matching?
**A:** Language models operate on text semantics, which introduces ambiguity. "Java" the language vs "Java" the island. "Python" the language vs "Python" the snake. Our system uses exact vocabulary matching against a curated 692-skill index — no ambiguity. LLMs are used where they excel (ranking and reasoning), not where they're unreliable (quantitative matching).

### Q: How are learning resources generated?
**A:** Gemini AI generates resources based on:
1. The target career's skill requirements
2. The user's current skill level (extracted from resume)
3. The phase (foundation vs advanced)
Each resource includes: title, provider (Coursera, edX, etc.), estimated duration, type (course/certification/project), and URL. The system also includes fallback resources if Gemini fails.

### Q: What happens when the user adds a skill to their profile?
**A:** The "Add to Profile" button triggers a POST request that appends the skill to `profile_data.skills.technical` in MongoDB. On the next recommendation or learning plan generation, this skill will be included in the user's vector — leading to updated, progressively refined recommendations.

### Q: How is data freshness maintained?
**A:** O\*NET updates quarterly. The `fetch_api_data.py` script can be re-run to refresh the API cache. JSearch provides real-time job market data. The model can be retrained periodically with the updated data pipeline (process → train → export → deploy — fully automated scripts).

### Q: What are the system's limitations?
**A:**
1. Vocabulary is fixed at 692 skills — emerging technologies need a vocab refresh and model retraining
2. O\*NET data is U.S.-centric — some global market nuances may be missed
3. Gemini ranking depends on API availability — fallback exists but provides less nuanced results
4. Resume parsing quality affects recommendation quality — poorly formatted resumes may miss skills
5. The model doesn't capture skill proficiency levels — it's binary (know/don't know)

---

## 11. File Reference

| File | Purpose |
|------|---------|
| `frontend/src/components/Career Path Recommendation/CareerPathRecommendation.jsx` | Main frontend component — UI, state management, API calls |
| `frontend/src/components/Career Path Recommendation/CareerPathRecommendation.css` | Styling for the entire page |
| `backend/app/routers/career_path.py` | All API endpoints (recommendations, save, learning plan, regenerate) |
| `backend/app/services/career_recommendation_service.py` | ML pre-filter + Gemini ranking pipeline |
| `backend/app/services/learning_plan_service.py` | Skill gap analysis + ML recommender + Gemini plan generation |
| `backend/app/services/gemini_service.py` | Gemini API wrapper (prompt construction, response parsing) |
| `backend/app/ml/models/skill_autoencoder.py` | PyTorch model definition (Encoder + Decoder + DenoisingWrapper) |
| `backend/app/ml/training/train_skill_recommender.py` | Training script (data loading, train loop, early stopping) |
| `backend/app/ml/inference/skill_recommender.py` | NumPy-only inference service (forward pass without PyTorch) |
| `backend/app/ml/data/skill_data_processor.py` | Data pipeline (7 sources → vocabulary → binary vectors) |
| `backend/app/ml/data/fetch_api_data.py` | O\*NET API + JSearch API data fetcher (resumable, cached) |
| `backend/app/ml/export_to_numpy.py` | PyTorch checkpoint → NumPy `.npz` exporter |
| `backend/app/career_data/skills_data/` | O\*NET Excel files (Technology Skills, Skills, Knowledge) |
| `backend/app/career_data/onet_occupations_data.json` | 894 occupation codes and titles |
