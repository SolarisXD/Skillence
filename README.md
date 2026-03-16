# Skillence

**AI-Powered Career Intelligence Platform**

Skillence is a full-stack web application that combines resume parsing, AI career recommendations, job market analytics, campus placement management, and interview coaching into a single unified platform. Built as a final-year B.Tech project.

---

## Features

### Resume Intelligence
- **AI-Powered Resume Parsing** — Upload PDF/DOCX resumes. Azure AI Document Intelligence extracts text, then Google Gemini structures it into categorized data (skills, experience, education, projects, certifications).
- **Fallback Parser** — spaCy + NLTK regex-based parser activates automatically if Azure/Gemini are unavailable.
- **SHA-256 Deduplication** — Prevents re-processing of identical uploads.
- **Profile Editor** — Review and manually edit parsed resume data before saving.

### Career Path Recommendation
- **3-Stage AI Pipeline** — (1) Map user skills to a 692-skill vocabulary via exact match, aliases, and fuzzy regex. (2) Dot-product pre-filter narrows 894 O\*NET occupations to top 30 candidates in ~1ms. (3) Google Gemini ranks and scores the top 10 with explanations.
- **3-Phase Learning Roadmaps** — Personalized skill gap analysis using O\*NET Skills, Technology Skills, and Knowledge databases. Synonym-aware matching with 70% coverage threshold. ML-enhanced skill recommendations.
- **Progress Tracking** — Save career paths, track learning milestones, mark skills as completed with checkpoint persistence.

### Job Market Analytics
- **Rich Dashboard** — Analyze ~30,000 job postings with advanced filtering (location, industry, experience level, salary range, company size, employment type).
- **Trendiness Scoring** — Composite score: recency (40%) + salary (30%) + benefits (20%) + growth (10%).
- **AI Insights** — Gemini-powered market analysis and career advice.
- **ML Salary Prediction** — Neural network predicts salaries based on skills, experience, location, industry, and more.
- **Data Export** — Download filtered results as CSV or JSON.

### Job Offer Evaluator
- **Side-by-Side Comparison** — Compare two job offers with salary charts (Chart.js), cost-of-living analysis via Gemini, and interactive Leaflet maps with Nominatim geocoding.
- **Market Context** — Adzuna API integration for salary benchmarks across 25+ countries.

### Campus Placement System
- **Placement Cell Dashboard** (admin role) — Create and manage company drives, upload/parse job descriptions (Gemini + keyword fallback), manage course catalogs, shortlist students algorithmically.
- **Student Portal** — Browse drives (upcoming/expired/not-eligible tabs), upload grade history PDFs, view eligibility and match scores, apply and track applications.
- **Matching Engine** — Pure algorithmic scoring (zero LLM): `total = required_skills×0.70 + preferred_skills×0.15 + resume_bonus×0.10 + cgpa_bonus×0.05`. Eligibility gate checks 10th%, 12th%, CGPA, and active backlogs.
- **Grade History Parsing** — VIT-style PDF parser extracts courses, grades (S=10 to F=0), credits, and CGPA. Handles retakes by keeping best grade.
- **Course→Skill Mapping** — Curriculum PDFs parsed and mapped to canonical skills via Gemini AI.

### AI Chatbot
- **Career Guidance** — Multi-turn conversational AI powered by Gemini. Context-aware with user profile data. Includes platform navigation guidance.
- **Speech Support** — Web Speech API for speech-to-text input and text-to-speech output.
- **Session Persistence** — Chat history stored in localStorage across page refreshes.

### Reflection Engine (Interview Coach)
- **Interview Diagnostic** — AI-powered interview coaching using a structured "MistakeLoop" methodology.
- **Contextual Coaching** — Incorporates user profile and career goals for personalized feedback.

### ML Models
- **Skill Recommender** — Denoising Autoencoder trained on O\*NET occupation–skill data. Recommends skills based on reconstruction confidence, suppressing 40+ generic/non-actionable terms.
- **Salary Predictor** — MLP with skip connections trained on ~30K job postings. Encodes skills (binary vector), experience, location, industry, company size, education level, and employment type.
- **NumPy-Only Inference** — Both models are trained with PyTorch offline, exported to `.npz`, and run in production via pure NumPy to avoid PyTorch DLL crashes on Windows.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI 0.104.1, Python 3.8+, Uvicorn |
| **Frontend** | React 19.1, Vite 7, pnpm |
| **Database** | MongoDB Atlas (async Motor 3.3 driver) |
| **AI Services** | Google Gemini 2.5 Flash, Azure AI Document Intelligence |
| **ML Training** | PyTorch 2.x (offline only) |
| **ML Inference** | Pure NumPy (no PyTorch at runtime) |
| **Auth** | JWT (HS256) + bcrypt + Google OAuth 2.0 |
| **Career Data** | O\*NET (894 occupations, 692-skill vocabulary) |
| **Charts** | Recharts (job trends), Chart.js (offer evaluator) |
| **Maps** | Leaflet + react-leaflet + Nominatim geocoding |
| **Icons** | Lucide React |
| **Animations** | Motion library |
| **WebGL** | OGL (neural network background) |
| **Speech** | Web Speech API (STT/TTS) |
| **HTTP** | Fetch API (general), Axios (chatbot) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                      │
│  Port 3000 · Vite 7 · pnpm · react-router-dom v7           │
│                                                              │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Resume   │ │  Career    │ │  Job     │ │  Placement   │ │
│  │ Dashboard │ │  Recommend │ │  Trends  │ │  (Student/   │ │
│  │          │ │            │ │          │ │   Admin)     │ │
│  └──────────┘ └────────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Chatbot │ │  Reflection│ │  Job     │ │   Profile    │ │
│  │          │ │  Engine    │ │  Offer   │ │   Page       │ │
│  └──────────┘ └────────────┘ └──────────┘ └──────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (fetch / axios)
┌──────────────────────▼──────────────────────────────────────┐
│                  Backend (FastAPI)                            │
│  Port 8000 · 9 Routers · Async Motor · JWT Auth             │
│                                                              │
│  Routers:  auth · resume · profile · career_path · chatbot  │
│            job_trends · ml_predictions · placement_cell      │
│            student_placement                                 │
│                                                              │
│  Services: 14 service modules (auth, resume parsing,        │
│            career matching, learning plans, job trends,      │
│            placement matching, JD parsing, academics, etc.)  │
│                                                              │
│  ML:       NumPy-only inference (skill recommender +         │
│            salary predictor) loaded lazily on first request  │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────────┐
          ▼            ▼                ▼
   ┌────────────┐ ┌──────────┐ ┌────────────────┐
   │  MongoDB   │ │  Gemini  │ │  Azure AI Doc  │
   │  Atlas     │ │  2.5     │ │  Intelligence  │
   │            │ │  Flash   │ │                │
   └────────────┘ └──────────┘ └────────────────┘
```

---

## Getting Started

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** with **pnpm**
- **MongoDB Atlas** instance (or local MongoDB)
- **API Keys:** Google Gemini, Azure AI Document Intelligence
- **Optional API Keys:** O\*NET Web Services, JSearch (RapidAPI), Adzuna, Google OAuth

### Environment Variables

Create a `.env` file in the **project root** (not inside `backend/` or `frontend/`):

```env
# Database
MONGODB_URI=mongodb+srv://...

# JWT Authentication
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Azure AI Document Intelligence
AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_API_KEY=your-azure-key

# Google Gemini AI
GEMINI_API=your-gemini-api-key
GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash

# Email (Password Reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000

# CORS (Backend)
# Comma-separated values
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
# Regex for preview deployments (Vercel)
CORS_ORIGIN_REGEX=https://.*\\.vercel\\.app

# Data Enrichment (Optional - for ML training only)
ONET_API_KEY=your-onet-key
JSEARCH_API_KEY=your-jsearch-key

# Frontend (VITE_ prefix required)
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_ADZUNA_API_KEY=your-adzuna-key
VITE_ADZUNA_APP_ID=your-adzuna-app-id
VITE_GEMINI_API_KEY=your-gemini-key-for-frontend
```

### Installation & Running

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm run dev
```

The frontend runs at `http://localhost:3000` and the backend API at `http://localhost:8000`.

---

## Deployment (Vercel + Render)

This repository is set up for split deployment:
- Frontend: `frontend/` on Vercel
- Backend: `backend/` on Render

### 1) Deploy backend to Render (GitHub import)

- Import this repo into Render.
- Use the existing [render.yaml](render.yaml) blueprint, or create a Web Service manually with:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set environment variables in Render (prompted by `sync: false` in blueprint), especially:
   - `MONGODB_URI`, `SECRET_KEY`, `GEMINI_API`, `AZURE_ENDPOINT`, `AZURE_API_KEY`
   - `FRONTEND_URL` = your Vercel production URL (e.g. `https://your-app.vercel.app`)
   - `CORS_ORIGINS` = comma-separated Vercel + local origins
- After deploy, copy your Render backend URL (e.g. `https://your-backend.onrender.com`).

### 2) Deploy frontend to Vercel (GitHub import)

- Import this repo into Vercel.
- Set **Root Directory** to `frontend`.
- Framework preset: **Vite** (auto-detected).
- Ensure environment variable:
   - `VITE_API_URL` = your Render backend URL (no trailing slash)
- SPA routing fallback is configured in [frontend/vercel.json](frontend/vercel.json).

### 3) Local + production compatibility

- Local dev defaults still work (`VITE_API_URL` defaults to `http://localhost:8000`).
- Backend CORS now supports both local origins and configured deployment origins.
- Password reset email links now use `FRONTEND_URL` instead of hardcoded localhost.

---

## Project Structure

```
/
├── .env                             # All environment variables (root level)
├── .github/copilot-instructions.md  # AI agent context (comprehensive)
├── package.json                     # Root package.json
│
├── backend/
│   ├── main.py                      # FastAPI entrypoint, 9 routers
│   ├── requirements.txt             # Python dependencies
│   ├── run_salary_pipeline.py       # CLI: salary model training pipeline
│   ├── seed_course_catalog.py       # CLI: curriculum PDF → MongoDB seed
│   └── app/
│       ├── database.py              # Async Motor client
│       ├── models/                  # Pydantic models (user, resume, placement, roadmap)
│       ├── routers/                 # 9 API routers
│       ├── services/                # 14 business logic services
│       ├── utils/                   # JWT, role auth, email
│       ├── data/                    # skill_taxonomy.json
│       ├── career_data/             # O*NET JSON + Excel + job CSVs
│       └── ml/                      # ML pipeline (models, training, inference, data)
│
├── frontend/
│   ├── package.json                 # React 19, Vite 7
│   ├── vite.config.js               # Port 3000, envDir: root
│   └── src/
│       ├── App.jsx                  # Routes, ProtectedRoute, RoleRoute
│       ├── main.jsx                 # GoogleOAuthProvider, theme init
│       └── components/              # 23+ components organized by feature
│
└── docs/                            # Documentation files
```

---

## API Reference

### Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Create account (student or placement_cell) |
| POST | `/login` | — | Email/password login → JWT |
| POST | `/google-login` | — | Google OAuth login (Gmail only) |
| GET | `/verify` | Bearer | Verify JWT validity |
| GET | `/me` | Bearer | Get current user info |
| POST | `/forgot-password` | — | Send reset email |
| POST | `/reset-password` | — | Reset with token |

### Resume — `/api/resume`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | Bearer | Upload resume file |
| POST | `/parse` | Bearer | Parse uploaded resume (Azure AI + Gemini) |
| GET | `/{user_id}` | Bearer | Get parsed resume data |

### Profile — `/api/profile`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/save` | Bearer | Save profile data |
| GET | `/` | Bearer | Get user profile |
| PUT | `/update` | Bearer | Update profile |

### Career Path — `/api/career-path`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/recommendations` | Bearer | Get AI career recommendations (top 10) |
| POST | `/save-career` | Bearer | Save selected career path |
| GET | `/learning-plan` | Bearer | Generate 3-phase learning roadmap |
| PUT | `/learning-plan` | Bearer | Update learning progress |
| POST | `/update-learned-skill` | Bearer | Mark skill as learned |

### Chatbot — `/api/chatbot`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat` | Optional | Career guidance conversation |

### Reflection Engine — `/api/reflection-engine`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat` | Optional | Interview coaching conversation |

### Job Trends — `/api/job-trends`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/jobs` | — | List jobs with filters |
| GET | `/analysis/{job_title}` | — | Job analysis |
| GET | `/skills/{job_title}` | — | Skill demand for job |
| GET | `/overview` | — | Market overview |
| GET | `/trends/{job_title}` | — | Time-series trends |
| GET | `/experience-distribution/{job_title}` | — | Experience breakdown |
| GET | `/filter-options` | — | Available filter values |
| GET | `/ai-insights` | — | AI market insights |
| GET | `/ai-insights-gemini` | — | Gemini-specific insights |
| GET | `/detailed-analysis/{job_title}` | — | Comprehensive analysis |
| GET | `/cache-info` | — | Cache status |
| POST | `/clear-cache` | — | Clear data cache |
| GET | `/export/csv` | — | Export as CSV |
| GET | `/export/json` | — | Export as JSON |
| POST | `/predict-salary` | — | ML salary prediction |

### ML Predictions — `/api/ml`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/recommend-skills` | — | Skill recommendations from autoencoder |
| GET | `/health` | — | Model health check |

### Placement Cell — `/api/placement` (placement_cell role)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/drives` | Role | Create company drive |
| GET | `/drives` | Role | List all drives |
| GET | `/drives/{id}` | Role | Get drive details |
| PUT | `/drives/{id}` | Role | Update drive |
| DELETE | `/drives/{id}` | Role | Delete drive |
| POST | `/drives/{id}/jd` | Role | Upload/parse JD |
| GET | `/courses` | Role | List course catalog |
| POST | `/courses` | Role | Add course |
| PUT | `/courses/{id}` | Role | Edit course |
| DELETE | `/courses/{id}` | Role | Delete course |
| POST | `/curriculum/upload` | Role | Upload curriculum PDF |
| POST | `/drives/{id}/shortlist` | Role | Shortlist students |
| PUT | `/applications/{id}/status` | Role | Update application status |

### Student Placement — `/api/student/placement` (student role)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/academics` | Role | Get academic profile |
| POST | `/academics/grade-history` | Role | Upload grade history PDF |
| PUT | `/academics` | Role | Update 10th/12th% |
| GET | `/academics/skills` | Role | Get skill profile |
| GET | `/drives` | Role | Browse drives (with tabs) |
| GET | `/drives/{id}` | Role | Drive detail + match score |
| POST | `/apply/{drive_id}` | Role | Apply to drive |
| GET | `/applications` | Role | View applications |
| DELETE | `/applications/{id}` | Role | Withdraw application |

---

## ML Pipeline

Both models follow the same workflow: **Train (PyTorch) → Export (.npz) → Infer (NumPy)**.

### Skill Recommender
- **Architecture:** Denoising Autoencoder — Encoder: V→256→128→64→32 (latent). Decoder mirrors. BatchNorm + LeakyReLU(0.2) + Dropout(0.3). Sigmoid output.
- **Data:** Binary skill–occupation vectors from O\*NET Excel files, occupation JSON, job CSVs, and cached API data.
- **Training:** BCE loss, Adam optimizer, 30% input corruption, early stopping (patience=20).

### Salary Predictor
- **Architecture:** MLP with skip connections — Input→512→256→128→64→1. BatchNorm + ReLU + Dropout(0.3). He initialization.
- **Data:** ~30K job postings. Features: binary skill vector, scaled experience, label-encoded categoricals, one-hot experience level.
- **Training:** MSE loss, Adam, gradient clipping, early stopping (patience=25).

### Running the ML Pipeline
```bash
cd backend

# Skill recommender
python -m app.ml.data.fetch_api_data          # Fetch O*NET + JSearch data (optional)
python -m app.ml.data.skill_data_processor     # Build vocabulary
python -m app.ml.training.train_skill_recommender  # Train
python -m app.ml.export_to_numpy               # Export to .npz

# Salary predictor (all-in-one)
python run_salary_pipeline.py
# Or with flags: --skip-processing --skip-training --skip-export --model lite|full
```

### Course Catalog Seeding
```bash
cd backend
python seed_course_catalog.py --pdf ../curr.pdf
```

---

## User Roles

| Role | Access | Key Pages |
|------|--------|-----------|
| **student** (default) | Resume upload, career recommendations, job trends, placement portal, chatbot | `/dashboard/resume`, `/career-path-recommendation`, `/campus-placement` |
| **placement_cell** | All student features + drive management, JD parsing, shortlisting, curriculum management | `/placement-dashboard` |
| **Unauthenticated** | Landing page, job trends, job offer evaluator, reflection engine, static pages | `/`, `/job-trends`, `/job-offer-evaluator`, `/reflection-engine` |

---

## External Services

| Service | Purpose | Used In |
|---------|---------|---------|
| **Azure AI Document Intelligence** | Resume text extraction (PDF/DOCX) | Backend: `azure_resume_parser.py` |
| **Google Gemini 2.5 Flash** | Career ranking, learning plans, chatbot, interview coaching, JD parsing, resume structuring, course mapping, cost-of-living | Backend (6+ services) + Frontend (Job Offer Evaluator) |
| **O\*NET Web Services** | Occupation data enrichment for ML training | Backend: `fetch_api_data.py` |
| **JSearch (RapidAPI)** | Job posting data for ML training | Backend: `fetch_api_data.py` |
| **Adzuna API** | Salary benchmarks, job market data | Frontend: `JobOfferEvaluator` |
| **Nominatim (OSM)** | Geocoding for map location picker | Frontend: `MapLocationPicker` |
| **Google OAuth 2.0** | Social login | Frontend → Backend |

---

## Key Design Decisions

1. **NumPy-Only Inference** — PyTorch triggers `c10.dll` / `WinError 1114` crashes when loaded inside async FastAPI on Windows. Models are trained offline with PyTorch, exported to `.npz` weight files, and the forward pass uses 4 pure-NumPy functions (`_linear`, `_batchnorm`, `_leaky_relu`/`_relu`, `_sigmoid`).

2. **Single Root `.env`** — All environment variables live in one `.env` at the project root. Vite uses `envDir: '..'` to access it. Backend services load it via `dotenv` with relative paths.

3. **No Global State Management** — Frontend uses React `useState` + `localStorage` only. No Redux, Context API, or Zustand. Auth tokens, chat sessions, and theme preferences are all in `localStorage`.

4. **Gemini JSON Repair** — Gemini responses frequently include trailing commas, truncated output, or markdown fences. Multiple services implement `_try_repair_json()` helpers.

5. **Lazy Model Loading** — ML models (`SkillRecommender`, `SalaryPredictorInference`) are loaded on first API request, not at server startup, to keep startup fast.

6. **Service-Oriented Backend** — Routers delegate to services; services own business logic. Exception: `career_path.py` has inline scoring logic alongside service calls (technical debt).

7. **Dual Resume Parser** — Primary: Azure AI + Gemini (high accuracy). Fallback: spaCy + NLTK + regex (works offline). Automatic failover.

8. **Pure Algorithmic Placement Matching** — The matching engine uses zero LLM calls. Weighted formula with eligibility gates ensures deterministic, fast, and explainable results.

---

## Database Collections

| Collection | Purpose |
|------------|---------|
| `users` | User accounts (email, hashed password, role, name) |
| `profiles` | Parsed resume data (contact, skills, experience, education, projects) |
| `resumes` | Resume metadata with SHA-256 file hashes |
| `company_drives` | Placement drives with JD, criteria, package info |
| `applications` | Student applications to drives with status tracking |
| `student_academics` | CGPA, 10th/12th%, courses, skills, grade history |
| `course_catalog` | Course → skill mappings from curriculum PDFs |
| `learning_roadmaps` | Saved career paths and learning plan progress |

---

## License

This project was built as a final-year B.Tech capstone project.
