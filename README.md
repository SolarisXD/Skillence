# Skillence — AI-Powered Career Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Azure AI](https://img.shields.io/badge/Azure_AI-0089D0?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

**Skillence** is a full-stack career intelligence platform that combines **custom-trained deep learning models**, **Google Gemini AI**, **Azure Document Intelligence**, and the **U.S. Department of Labor's O\*NET database** to deliver personalized career guidance — from resume parsing to career matching to learning roadmaps. Unlike tools that rely solely on LLMs, Skillence uses a **hybrid ML + AI architecture** where machine learning handles quantitative matching at scale and AI handles qualitative reasoning, producing results that are faster, more consistent, and more accurate than either approach alone.

---

## Table of Contents

- [What Makes Skillence Unique](#what-makes-skillence-unique)
- [Features](#features)
  - [Career Path Recommendation](#1-ai-powered-career-path-recommendation)
  - [Resume Processing](#2-intelligent-resume-processing)
  - [Salary Predictor](#3-ml-powered-salary-predictor)
  - [Skill Recommender](#4-denoising-autoencoder-skill-recommender)
  - [Learning Roadmaps](#5-personalized-learning-roadmaps)
  - [Job Trend Dashboard](#6-job-trend-analytics-dashboard)
  - [Job Offer Evaluator](#7-job-offer-evaluator)
  - [AI Career Chatbot](#8-ai-career-chatbot)
  - [Reflection Engine](#9-reflection-engine--interview-coach)
  - [Profile & Auth](#10-user-profile--authentication)
  - [Theme System](#11-theme-system)
- [Machine Learning — Deep Dive](#machine-learning--deep-dive)
  - [Model 1: Skill Recommender Autoencoder](#model-1-skill-recommender-autoencoder)
  - [Model 2: Salary Predictor MLP](#model-2-salary-predictor-mlp)
  - [NumPy-Only Inference](#numpy-only-inference-why-no-pytorch-at-runtime)
- [System Architecture](#system-architecture)
- [Data Sources](#data-sources)
- [Technology Stack](#technology-stack)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Future Roadmap](#future-roadmap)

---

## What Makes Skillence Unique

| Innovation | Description |
|---|---|
| **Hybrid ML + AI Pipeline** | Custom-trained ML models handle quantitative matching (894 occupations in ~1 ms), while Gemini AI handles qualitative reasoning (ranking, explanations). Neither alone achieves this quality. |
| **NumPy-Only Inference** | Models are trained with PyTorch but deployed using pure NumPy forward passes — zero heavy dependencies at runtime, no DLL conflicts, instant cold starts. |
| **Denoising Autoencoder for Skills** | A novel application of denoising autoencoders to career skill recommendation. The model learns a 32-dimensional "career DNA" latent space from 17,375 real skill profiles. |
| **7-Source Data Fusion** | Merges 3 O\*NET Excel files, 1 JSON, 1 CSV, O\*NET REST API, and JSearch API into a unified 692-skill vocabulary covering 894 occupations. |
| **3-Stage Career Matching** | ML dot-product pre-filter (894 → 30, ~1 ms) → Gemini ranking (30 → 10, ~3 s) → Technology enrichment. Faster, cheaper, and more accurate than prompting an LLM with 894 occupations. |
| **Resume-Driven Personalization** | Not questionnaire-based — uses Azure AI Document Intelligence to parse actual resumes, then Gemini AI to structure the data into a machine-readable profile. |
| **3-Source Priority Merging** | Learning plans merge AI-identified skill gaps + O\*NET industry-validated hot technologies + ML autoencoder recommendations into a single prioritized list. |
| **Voice-Enabled Chatbot** | Built-in speech-to-text and text-to-speech capabilities using the Web Speech API, making the career advisor accessible hands-free. |

### vs. Existing Solutions

| Platform | Approach | Limitation Skillence Solves |
|---|---|---|
| **ChatGPT / Gemini alone** | Conversational AI only | Hallucinates careers; no quantitative basis; inconsistent results; no resume data |
| **LinkedIn** | Job listings | Doesn't analyze YOUR skills against occupation requirements |
| **Indeed** | Keyword search | No personalized career matching or learning plans |
| **MyNextMove (O\*NET)** | Interest questionnaire | Generic; no ML; doesn't use resume data |
| **Coursera / Udemy** | Course recommendations | Recommends courses, not career paths |
| **Traditional counseling** | Manual assessment | Expensive, slow, not data-driven |

Skillence combines resume analysis + ML skill matching + AI reasoning + government occupational data + personalized learning roadmaps — no other tool does all of these together.

---

## Features

### 1. AI-Powered Career Path Recommendation

The flagship feature. Analyzes a user's parsed resume profile, matches skills against **894 real occupations** from the U.S. Department of Labor's O\*NET database, and generates ranked career recommendations with explanations.

**How it works (3-stage pipeline):**

1. **ML Pre-Filter (~1 ms):** Extracts the user's skills from their resume profile, maps them to a 692-dimensional binary vector, and computes dot products against all 894 occupation profiles. The top 30 candidates are selected instantly.
2. **Gemini AI Ranking (~3 s):** The top 30 candidates, along with the user's full profile (education, experience, projects), are sent to Gemini 2.5 Flash (temperature 0.1 for consistency). Gemini returns the final top 10 with compatibility scores (0–100%) and contextual explanations.
3. **Technology Enrichment:** Each recommendation is enriched with hot technology matches (in-demand skills the user already has) and required technologies for the role.

**Key details:**
- Skill matching uses exact match, 30+ aliases (`js` → `javascript`, `k8s` → `kubernetes`), and fuzzy regex matching
- If Gemini is unavailable, deterministic fallback scoring activates automatically
- Selected career path is persisted to MongoDB for use across features
- Full results are cached to avoid repeated API calls

### 2. Intelligent Resume Processing

Upload a resume (PDF or DOCX, up to 10 MB) and the system extracts structured professional data using a two-stage AI pipeline.

**Pipeline:**
1. **Azure AI Document Intelligence** extracts raw text from the document with high-fidelity layout understanding
2. **Google Gemini AI** structures the extracted text into a machine-readable format: contact info, education, work experience, skills (technical + soft), projects, certifications, and achievements
3. The structured data is validated against Pydantic models and saved to MongoDB
4. Duplicate detection via SHA-256 file hashing prevents redundant processing

**Fallback:** If Azure is unavailable, a basic NLP parser (using spaCy, NLTK, phonenumbers, and nameparser) handles extraction locally.

**Supported output fields:** Contact info, education (degree, institution, GPA), work experience (title, company, dates, technologies), skills (technical, soft, languages), projects (name, description, technologies, links), certifications, and achievements.

### 3. ML-Powered Salary Predictor

A deep neural network that predicts personalized salaries based on a user's skills, experience, location, and industry.

**Model:** Multi-Layer Perceptron with skip connections  
**Architecture:** `Input(~520) → 512 → 256 → 128 → 64 → 1`  
**Training data:** ~30,000 job postings from two CSV datasets  
**Performance:** R² = 0.726, RMSE = 0.539, MAE = 0.387  

**Features:**
- 466-skill vocabulary with binary encoding
- Multi-factor confidence scoring (skills 40%, experience 15%, location 15%, industry 15%, details 15%)
- Market comparison with average, median, min, max, and percentile ranking
- Historical salary trends visualization (12-month chart via Recharts)
- Smart skill autocomplete with 24 ML-recognized core skills
- Circular confidence meter with component breakdown

**Input features (34 total):** 24 skill binary vectors, years of experience, label-encoded location/industry/company size/education/employment type, and one-hot encoded experience level.

### 4. Denoising Autoencoder Skill Recommender

A custom-trained denoising autoencoder that learns skill co-occurrence patterns across 15,923 career profiles and recommends what skills a user should learn next for a target career.

**Problem:** Given a user's current skills, what other skills should they learn?  
**Approach:** Treat it as a reconstruction problem — compress the user's partial skill vector into a 32-dim latent space, then reconstruct the full skill vector. The gap between input and output reveals recommended skills.

**Architecture:**
```
Encoder:  Input(466) → 256 → 128 → 64 → Latent(32)
Decoder:  Latent(32) → 64  → 128 → 256 → Output(466)
```
- BatchNorm + LeakyReLU(0.2) + Dropout at every layer
- Sigmoid output (binary skill reconstruction)
- **Denoising:** 30% of input skills are randomly zeroed during training, forcing the model to learn robust co-occurrence patterns rather than memorizing
- Loss: Binary Cross-Entropy | Optimizer: Adam with ReduceLROnPlateau

**Training results:** Best val_loss = 0.0061, trained on 13,535 samples (85/15 split), early stopped at epoch 174/200.

**Career targeting:** When a target occupation is specified, the recommender adds a 50% confidence boost to skills that appear in that career's profile, ensuring recommendations are career-relevant.

### 5. Personalized Learning Roadmaps

After selecting a career from recommendations, Skillence generates a comprehensive, personalized learning plan.

**Generation pipeline:**
1. **O\*NET Data Extraction:** Core skills (importance ≥ 4.0), technical skills, hot technologies, and knowledge areas for the target occupation
2. **ML Skill Recommender:** The autoencoder produces top-20 ranked skill suggestions with confidence scores
3. **Skill Gap Analysis:** Compares user's current skills against career requirements using direct matching, synonym detection, and partial word matching
4. **Gemini AI Roadmap:** All data is sent to Gemini to generate a 3-phase roadmap

**Output structure:**
- **Skill Gap Analysis:** Missing skills, missing hot technologies, current strengths
- **Priority Skills:** Unified list from 3 sources (Gemini-identified + O\*NET hot tech + ML recommendations), capped at 12, with AI-generated descriptions explaining why each skill matters
- **3-Phase Roadmap:**
  - Phase 1: Foundation (basics and fundamentals)
  - Phase 2: Technical Development (core skills building)
  - Phase 3: Specialization & Mastery (advanced skills)
- Each phase includes skills, learning resources (title, provider, duration, type, URL), projects, and milestones
- **ML-Enhanced badge** when autoencoder recommendations are included
- Plans are persisted to MongoDB — no re-generation on subsequent visits

### 6. Job Trend Analytics Dashboard

Interactive dashboard for exploring AI/tech job market data with advanced filtering and visualization.

**Data source:** ~30,000 job postings from static CSV datasets (ai_job_dataset.csv + ai_job_dataset1.csv).

**Features:**
- **Advanced Filtering:** Location, industry, experience level, salary range, company size, employment type
- **Interactive Charts:** Trend analysis, skill demand distribution, experience level breakdown (via Recharts)
- **Data Export:** CSV and JSON export with chart image generation (html2canvas)
- **Caching System:** 1-hour configurable cache with manual clear option
- **Auto-refresh:** Configurable refresh intervals
- **Salary Predictor Tab:** Integrated ML salary prediction (see Feature #3)

### 7. Job Offer Evaluator

Compare and evaluate job offers against real market data to make informed decisions.

**Integrations:**
- **Adzuna API:** Fetches real salary benchmarks for 25+ countries (US, UK, India, Germany, Canada, Australia, etc.)
- **Gemini 2.5 Flash:** AI-powered comprehensive offer analysis
- **Leaflet Maps:** Interactive map-based location picker for geographic context

**Features:**
- Enter offer details (title, company, salary, benefits, location)
- Multi-country salary benchmarking with fallback data
- Side-by-side offer comparison
- Visualization via Chart.js (Line, Doughnut, Bar charts)
- Currency-aware analysis (USD, GBP, INR, EUR, etc.)
- AI-generated recommendations on offer quality

### 8. AI Career Chatbot

A context-aware AI chatbot powered by Gemini 2.5 Flash that provides personalized career guidance.

**Key capabilities:**
- **Profile-Aware:** Automatically fetches the user's parsed resume data (skills, education, experience, projects, certifications, achievements) and injects it into every conversation for personalized responses
- **Platform-Aware:** Knows all Skillence features and provides direct navigation links (e.g., "Go to Resume Dashboard → /dashboard/resume")
- **Voice Input:** Speech-to-text via Web Speech API for hands-free interaction
- **Voice Output:** Text-to-speech for spoken responses
- **Session Persistence:** Conversation history stored in localStorage (no server-side storage for privacy)
- **Modular Architecture:** Separate components for ChatHeader, MessageList, ChatInput, TypingIndicator
- **Markdown Sanitization:** Responses are cleaned of markdown symbols for clean display

**Available as:**
- Full-page chat interface (`/chatbot` route via SkillenceChat)
- Floating modal on the landing page (SkillenceChatModal)

### 9. Reflection Engine / Interview Coach

An AI-powered interview coaching system that transforms interview failures into actionable improvements.

**Philosophy:** *"Only mistakes can truly improve a person. Every failure teaches us what success cannot."*

**The MistakeLoop Process:**
1. **Mistake** — User shares what went wrong in an interview
2. **Detection** — AI analyzes patterns and identifies root causes
3. **Feedback** — Personalized, empathetic coaching advice
4. **Action** — Concrete improvement steps
5. **Review** — Track progress over time
6. **Repeat** — Continue the loop until mastery

**Technical details:**
- Powered by Gemini 2.5 Flash with a dedicated interview coach system prompt
- Scoped exclusively to interview topics — politely redirects off-topic questions
- Profile-aware — uses the user's skills, education, and experience for personalized coaching
- Session persistence via localStorage
- Clean, conversational tone — no markdown, no emojis, no rigid templates
- Separate backend endpoint (`POST /api/chatbot/reflection-coach`)

**UI:** Dedicated landing page with animated floating shapes, gradient beams, and particle effects → diagnostic chat interface.

### 10. User Profile & Authentication

**Authentication:**
- JWT-based auth (HS256, 30-minute expiration)
- Email/password registration and login
- Google OAuth integration (via `@react-oauth/google`)
- Password reset flow (email-based)
- Protected routes with `ProtectedRoute` wrapper component

**Profile Management:**
- Comprehensive profile editor: contact info, education, work experience, skills, projects, certifications, achievements
- Auto-populated from resume parsing
- Skills tracking (technical, soft, languages)
- Career path selection persisted to profile
- Learning plan progress saved to profile

**Database:** MongoDB Atlas with async Motor driver, `skillence_db` database.

### 11. Theme System

- **Light / Dark / Auto** modes
- Auto mode detects system preference via `prefers-color-scheme`
- Theme persisted to localStorage
- CSS custom properties (`--var`) for consistent theming
- Theme-reactive WebGL background (NeuralBg component using OGL)
- All components are theme-aware

---

## Machine Learning — Deep Dive

### Model 1: Skill Recommender Autoencoder

| Property | Value |
|---|---|
| **Type** | Denoising Autoencoder |
| **Framework** | PyTorch 2.x (training) → NumPy (inference) |
| **Input/Output Dimension** | 466 (skill vocabulary size) |
| **Latent Dimension** | 32 |
| **Training Samples** | 15,923 (923 O\*NET occupations + 15,000 CSV job postings) |
| **Data Sparsity** | 98.5% |
| **Best Validation Loss** | 0.0061 (BCE) |
| **Training Time** | ~340 s (CPU) |
| **Early Stopping** | Epoch 174 / 200 (patience 20) |

**Architecture detail:**
```
ENCODER:
  Input(466) → Linear(256) → BatchNorm → LeakyReLU(0.2) → Dropout(0.3)
             → Linear(128) → BatchNorm → LeakyReLU(0.2) → Dropout(0.3)
             → Linear(64)  → BatchNorm → LeakyReLU(0.2) → Dropout(0.15)
             → Linear(32)  → Latent Space

DECODER:
  Latent(32) → Linear(64)  → BatchNorm → LeakyReLU(0.2) → Dropout(0.15)
             → Linear(128) → BatchNorm → LeakyReLU(0.2) → Dropout(0.3)
             → Linear(256) → BatchNorm → LeakyReLU(0.2) → Dropout(0.3)
             → Linear(466) → Sigmoid → Output
```

**Why denoising?** A standard autoencoder might memorize inputs (identity mapping). By corrupting 30% of input skills during training, the model *must* learn robust co-occurrence patterns. Example: if the training sample `[React=1, JavaScript=1, CSS=1, Node.js=1]` has JavaScript zeroed out, the model must still reconstruct `JavaScript=1` — learning that React + CSS + Node.js strongly implies JavaScript.

**Why autoencoder over alternatives?**

| Alternative | Why Not |
|---|---|
| Collaborative Filtering / SVD | Assumes linear relationships; can't capture complex multi-skill interactions |
| Graph Neural Networks | Requires explicit graph construction; overhead for 466 features |
| Cosine Similarity | No learning — just compares vectors; misses latent patterns |
| Transformer / LLM | Massive overkill for binary vectors; designed for sequential data |
| K-Nearest Neighbors | Finds similar profiles but doesn't understand *why* skills co-occur |
| Random Forest / XGBoost | Classification models; not designed for reconstruction/recommendation |

**Data pipeline:**
1. Merge skill names from 7 sources → deduplicate → lowercase → filter ≥ 2 chars → sort → assign indices
2. For each occupation and job posting, create a 466-dim binary vector
3. Result: `(15,923 × 466)` binary matrix + vocabulary index

**Inference:**
1. Convert user's skills → 466-dim binary vector
2. Forward pass through autoencoder → reconstruction scores [0, 1] for all 466 skills
3. If target career specified → 50% confidence boost for career-relevant skills
4. Filter out known skills → rank by score → return top-K

### Model 2: Salary Predictor MLP

| Property | Value |
|---|---|
| **Type** | Multi-Layer Perceptron with Skip Connections |
| **Framework** | PyTorch 2.x (training) → NumPy (inference) |
| **Input Features** | ~520 (466 skills + categorical + numerical) |
| **Architecture** | 512 → 256 → 128 → 64 → 1 |
| **Training Samples** | ~30,000 (two CSV datasets combined) |
| **R² Score** | 0.7258 |
| **RMSE** | 0.5389 |
| **MAE** | 0.3868 |
| **Training Time** | 67.5 s (50 epochs, CPU) |
| **Inference Time** | 50–100 ms per prediction |

**Architecture detail:**
```
Input(F) → Linear(512) + BatchNorm + ReLU + Dropout(0.3)
         → Linear(256) + BatchNorm + Skip₁ + ReLU + Dropout(0.3)
         → Linear(128) + BatchNorm + ReLU + Dropout(0.24)
         → Linear(64)  + BatchNorm + Skip₂ + ReLU + Dropout(0.18)
         → Linear(1) [regression output]

Skip₁: Input → Layer 2 (gradient flow)
Skip₂: Layer 2 → Layer 4
```

**Also available:** A Lite variant (`256 → 128 → 64 → 1`) for faster inference.

**Features (34 core):**

| Feature Type | Count | Description |
|---|---|---|
| Skills | 24 (core) / 466 (full) | Binary vectors from skill vocabulary |
| Experience | 1 | Normalized years |
| Location | 1 | Label-encoded city |
| Industry | 1 | Label-encoded industry |
| Company Size | 1 | Small / Medium / Large |
| Education | 1 | Degree level |
| Employment Type | 1 | Full-time / Part-time / Contract |
| Experience Level | 4 | One-hot: Entry / Mid / Senior / Lead |

**Confidence scoring:**
```
confidence = skill_match * 0.40
           + experience  * 0.15
           + location    * 0.15
           + industry    * 0.15
           + details     * 0.15
```

### NumPy-Only Inference (Why No PyTorch at Runtime)

**Problem:** Loading PyTorch inside the FastAPI process on Windows causes `c10.dll` / `[WinError 1114]` crashes due to DLL initialization conflicts with the async event loop.

**Solution:** Export trained model weights to `.npz` files and reproduce the forward pass with 4 pure NumPy functions:

```python
def _linear(x, weight, bias):       return x @ weight.T + bias
def _batchnorm(x, mean, var, w, b): return w * (x - mean) / np.sqrt(var + 1e-5) + b
def _leaky_relu(x, slope=0.2):      return np.where(x > 0, x, slope * x)
def _sigmoid(x):                     return 1.0 / (1.0 + np.exp(-np.clip(x, -500, 500)))
```

**Benefits:**
- Zero dependency on PyTorch at runtime (193.5 KB weights file vs ~2 GB PyTorch)
- No CUDA/c10 initialization overhead
- Identical output to PyTorch (verified)
- Portable across environments
- Instant cold starts

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React 19 + Vite)                     │
│                                                                          │
│  MainPage        Resume       Career Path      Job Trends    Job Offer  │
│  (Landing)       Dashboard    Recommendation   Dashboard     Evaluator  │
│  ┌──────────┐   ┌──────────┐  ┌──────────────┐ ┌──────────┐ ┌────────┐ │
│  │ NeuralBg │   │ Upload + │  │ Analyze +    │ │ Charts + │ │ Adzuna │ │
│  │ AuthModal│   │ AI Parse │  │ ML+AI Match  │ │ Salary   │ │ Gemini │ │
│  │ Chatbot  │   │ Profile  │  │ Learning Plan│ │ Predictor│ │ Maps   │ │
│  └──────────┘   └──────────┘  └──────────────┘ └──────────┘ └────────┘ │
│                                                                          │
│  ReflectionEngine    ProfilePage    SkillenceChat    ThemeSelector       │
│  (Interview Coach)   (CRUD Profile) (Voice AI Chat)  (Light/Dark/Auto)  │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ REST API (JWT Auth)
┌───────────────────────────────▼──────────────────────────────────────────┐
│                       BACKEND (FastAPI + Python)                         │
│                                                                          │
│  Routers:  auth │ resume │ profile │ career_path │ job_trends │ chatbot │
│            ml_predictions                                                │
│                                                                          │
│  Services:                                                               │
│  ┌────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐ │
│  │ CareerRecommender  │  │ LearningPlanService  │  │ JobTrendService  │ │
│  │ (ML Pre-Filter +   │  │ (O*NET + ML + Gemini │  │ (CSV Analytics + │ │
│  │  Gemini Ranking)   │  │  Roadmap Generation) │  │  Salary Predict) │ │
│  └────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘ │
│           │                         │                        │           │
│  ┌────────▼─────────────────────────▼────────────────────────▼─────────┐ │
│  │                    ML INFERENCE (NumPy Only)                        │ │
│  │  SkillRecommender (466-dim autoencoder)                            │ │
│  │  SalaryInference  (~520-dim MLP)                                   │ │
│  │  Lazy-loaded singletons — model loads once on first request        │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  External APIs:                                                    │  │
│  │  • Azure AI Document Intelligence (resume parsing)                │  │
│  │  • Google Gemini 2.5 Flash (reasoning, ranking, roadmaps, chat)   │  │
│  │  • O*NET REST API (occupation data enrichment)                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  MongoDB Atlas (Async via Motor)                                   │  │
│  │  Collections: users, profiles (resume data, career_path,          │  │
│  │               saved_learning_plan), resumes                       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3-Stage Career Matching Pipeline

```
User Profile
     │
     ▼
┌─────────────────────────────────┐
│  STAGE 1: ML Pre-Filter (~1ms) │
│                                 │
│  Skills → 692-dim vector        │
│  Dot product vs 894 occupations │
│  → Top 30 candidates            │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  STAGE 2: Gemini Ranking (~3s) │
│                                 │
│  30 candidates + full profile   │
│  → Top 10 with scores (0-100%) │
│  + contextual explanations      │
│  Temperature: 0.1               │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  STAGE 3: Enrichment           │
│                                 │
│  Hot technology matches         │
│  Regular tech matches           │
│  O*NET occupation details       │
└─────────────────────────────────┘
```

**Why this approach?**

| Approach | Issue |
|---|---|
| Gemini alone for 894 occupations | Can't fit in context window; slow (45+ s); expensive; hallucination risk |
| ML alone (no AI) | Good recall but poor precision; can't understand career context |
| Rule-based matching | Too rigid; misses nuanced fits |
| **Hybrid (ML + AI)** | ML handles **scale** (894 → 30 in 1 ms); AI handles **nuance** (3 s for ranking) |

---

## Data Sources

| Source | Records | Purpose |
|---|---|---|
| **O\*NET Technology Skills.xlsx** | 32,681 rows | Technology names per occupation, hot technology flags |
| **O\*NET Skills.xlsx** | 62,580 rows | Core professional skills with importance ratings (1–5) |
| **O\*NET Knowledge.xlsx** | 59,004 rows | Knowledge areas with importance ratings |
| **onet_occupations_data.json** | 894 entries | Occupation codes, titles, required/optional skills |
| **ai_job_dataset.csv** | 15,000 rows | Job postings with required skills, salaries |
| **ai_job_dataset1.csv** | 15,000 rows | Additional job posting data |
| **O\*NET REST API** | 894 occupations | Live-fetched technology skills (resumable, rate-limited) |
| **JSearch API (RapidAPI)** | 20 role queries | Real job postings from 20 diverse tech roles |

**Processed statistics:**
- Skill vocabulary: **692 unique skills** (skill recommender) / **466 skills** (after filtering)
- Training samples: **17,375** (skill recommender) / **~30,000** (salary predictor)
- O\*NET occupations covered: **894**
- Skill aliases defined: **30+** (e.g., `js` → `javascript`, `k8s` → `kubernetes`)

---

## Technology Stack

### Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python web framework |
| **MongoDB Atlas** | Cloud database (async via Motor 3.3) |
| **PyTorch 2.x** | ML model training (CPU) |
| **NumPy** | ML inference at runtime |
| **Pandas** | Data processing and CSV/Excel operations |
| **Azure AI Document Intelligence** | Resume text extraction |
| **Google Gemini 2.5 Flash** | AI reasoning, ranking, chat, roadmap generation |
| **spaCy + NLTK** | NLP fallback for resume parsing |
| **python-jose** | JWT token management |
| **bcrypt + passlib** | Password hashing |

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Build tool and dev server |
| **React Router DOM 7** | Client-side routing |
| **Recharts** | Data visualization (salary trends, job analytics) |
| **Chart.js + react-chartjs-2** | Charts in Job Offer Evaluator |
| **Leaflet + react-leaflet** | Interactive maps |
| **OGL** | WebGL neural background animation |
| **Lucide React** | Icon library |
| **Motion** | Animations |
| **html2canvas** | Chart image export |
| **Tailwind CSS** | Utility-first styling |
| **Web Speech API** | Voice input/output for chatbot |
| **@react-oauth/google** | Google OAuth integration |

---

## API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | Login with email/password |
| POST | `/google-login` | Google OAuth login |
| GET | `/me` | Get current user info |
| GET | `/verify` | Verify JWT token |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password with token |

### Resume (`/api/resume`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload and parse resume (auth required) |
| POST | `/test-upload` | Upload without auth (debug) |
| GET | `/test` | Health check |

### Career Path (`/api/career-path`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/recommendations` | Get AI + ML career recommendations |
| POST | `/save-career-path` | Save selected career to profile |
| GET | `/learning-plan` | Generate personalized learning roadmap |

### Job Trends (`/api/job-trends`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/data` | Get job trend data |
| GET | `/analysis` | Get trend analysis |
| POST | `/predict-salary` | ML salary prediction |
| GET | `/salary-trends-ml/{job_title}` | Historical salary trends |
| GET | `/ml-status` | ML model health check |
| GET | `/export/csv` | Export data as CSV |
| GET | `/export/json` | Export data as JSON |
| POST | `/clear-cache` | Clear data cache |

### ML Predictions (`/api/ml`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/recommend-skills` | ML skill recommendations |
| GET | `/health` | Model readiness status |

### Chatbot (`/api/chatbot`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Career guidance chat |
| POST | `/reflection-coach` | Interview coaching chat |
| GET | `/health` | Service health check |

### Profile (`/api/profile`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get user profile |
| PUT | `/update` | Update user profile |

---

## Project Structure

```
Skillence/
├── README.md                           # This file
├── .env                                # Environment variables (API keys)
├── package.json                        # Root dependencies
│
├── backend/                            # FastAPI backend
│   ├── main.py                         # App entry point, CORS, router mounting
│   ├── requirements.txt                # Python dependencies
│   ├── run_salary_pipeline.py          # Automated ML training pipeline
│   │
│   └── app/
│       ├── database.py                 # MongoDB Atlas async connection
│       │
│       ├── models/                     # Pydantic data models
│       │   ├── user.py                 # User, Token, GoogleLogin models
│       │   ├── resume.py               # ResumeData, structured fields
│       │   └── learning_roadmap.py     # Learning plan models
│       │
│       ├── routers/                    # API endpoint handlers
│       │   ├── auth.py                 # JWT auth, Google OAuth, password reset
│       │   ├── resume.py               # Resume upload and parsing
│       │   ├── profile.py              # Profile CRUD
│       │   ├── career_path.py          # Career recommendations + learning plans
│       │   ├── job_trends.py           # Job analytics + salary prediction
│       │   ├── chatbot.py              # AI chat + reflection coach
│       │   └── ml_predictions.py       # ML skill recommendations
│       │
│       ├── services/                   # Business logic layer
│       │   ├── auth_service.py         # User registration, login, JWT
│       │   ├── resume_service.py       # Resume parse + save orchestration
│       │   ├── azure_resume_parser.py  # Azure AI + Gemini resume parsing
│       │   ├── resume_parser.py        # NLP fallback parser (spaCy/NLTK)
│       │   ├── career_recommendation_service.py  # ML pre-filter + Gemini ranking
│       │   ├── learning_plan_service.py           # O*NET + ML + Gemini roadmaps
│       │   ├── gemini_service.py       # Gemini API wrapper
│       │   ├── job_trend_service.py    # CSV analytics + salary prediction
│       │   └── profile_transformer.py  # Profile data transformation
│       │
│       ├── utils/
│       │   ├── security.py             # JWT encoding/decoding
│       │   └── email.py                # Email utilities
│       │
│       ├── ml/                         # Machine learning pipeline
│       │   ├── data/
│       │   │   ├── skill_data_processor.py    # 7-source data fusion
│       │   │   ├── salary_data_processor.py   # Salary feature engineering
│       │   │   ├── fetch_api_data.py          # O*NET + JSearch API fetcher
│       │   │   └── processed/                 # .npy, .json training artifacts
│       │   │
│       │   ├── models/
│       │   │   ├── skill_autoencoder.py       # Autoencoder PyTorch definition
│       │   │   ├── salary_predictor.py        # MLP PyTorch definition
│       │   │   └── checkpoints/               # Trained weights (.pt, .npz)
│       │   │
│       │   ├── training/
│       │   │   ├── train_skill_recommender.py # Autoencoder training
│       │   │   └── train_salary_model.py      # MLP training
│       │   │
│       │   ├── inference/
│       │   │   ├── skill_recommender.py       # NumPy-only autoencoder inference
│       │   │   └── salary_inference.py        # NumPy-only MLP inference
│       │   │
│       │   ├── export_to_numpy.py             # PyTorch → NumPy exporter (skills)
│       │   └── export_salary_to_numpy.py      # PyTorch → NumPy exporter (salary)
│       │
│       └── career_data/
│           ├── onet_occupations_data.json     # 894 occupation codes/titles
│           ├── skills_data/                   # O*NET Excel files
│           │   ├── Skills.xlsx
│           │   ├── Technology Skills.xlsx
│           │   └── Knowledge.xlsx
│           └── job_trend_data/
│               ├── ai_job_dataset.csv         # 15K job postings
│               └── ai_job_dataset1.csv        # 15K additional data
│
├── frontend/                           # React 19 + Vite SPA
│   ├── package.json                    # Dependencies (pnpm)
│   ├── vite.config.js                  # Vite configuration
│   ├── index.html                      # HTML entry point
│   ├── components.json                 # shadcn/ui config
│   │
│   └── src/
│       ├── main.jsx                    # React root render
│       ├── App.jsx                     # Router + protected routes
│       ├── App.css                     # Global styles
│       ├── index.css                   # CSS variables + reset
│       │
│       └── components/
│           ├── MainPage.jsx            # Landing page + feature showcase
│           ├── navbar.jsx              # Navigation bar
│           ├── AuthModal.jsx           # Login/Register modal
│           ├── NeuralBg.jsx            # WebGL animated background (OGL)
│           ├── ThemeSelector.jsx       # Light/Dark/Auto theme picker
│           ├── DeadlineTracker.jsx     # Deadline tracking widget
│           ├── ProgressBar.jsx         # Progress visualization
│           ├── TaskCheckbox.jsx        # Task completion widget
│           ├── ReflectionEngineHome.jsx           # Interview coach landing
│           ├── ReflectionEngineInterviewDiagnostic.jsx  # AI coaching chat
│           │
│           ├── Chatbot/
│           │   ├── SkillenceChat.jsx               # Full chat interface
│           │   ├── SkillenceChatModal.jsx           # Floating modal chat
│           │   ├── components/                      # ChatHeader, MessageList, ChatInput, TypingIndicator
│           │   ├── hooks/                           # useSpeechToText, useTextToSpeech
│           │   ├── services/                        # chatService.js
│           │   └── utils/                           # helpers
│           │
│           ├── Career Path Recommendation/
│           │   ├── CareerPathRecommendation.jsx     # Full feature page
│           │   └── CareerPathRecommendation.css
│           │
│           ├── Dashboard/
│           │   ├── ResumeDashboard.jsx              # Resume upload + parsing UI
│           │   └── ResumeDashboard.css
│           │
│           ├── Job Trend/
│           │   └── current/
│           │       ├── JobTrendDashboard.jsx         # Tab navigation
│           │       └── components/
│           │           ├── SalaryPredictor.jsx       # ML salary prediction UI
│           │           └── SalaryPredictor.css
│           │
│           ├── Job Offer Evaluator/
│           │   ├── JobOfferEvaluator.jsx            # Offer comparison + analysis
│           │   ├── JobOfferEvaluator.css
│           │   └── MapLocationPicker.jsx            # Leaflet map integration
│           │
│           ├── ProfilePage/
│           │   ├── ProfilePage.jsx                  # Profile CRUD
│           │   └── ProfilePage.css
│           │
│           └── Icons/                               # Custom SVG icon components
│
└── docs/                               # Documentation
    ├── Career_Path_Recommendation_Explained.md  # Technical deep dive
    ├── ML_IMPLEMENTATION_GUIDE.md               # ML pipeline docs
    ├── SALARY_PREDICTOR_README.md               # Salary model docs
    ├── DEVELOPMENT_STATUS.md                    # Dev status tracker
    └── Things_to_do.md                          # TODO list
```

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- pnpm (package manager)
- MongoDB Atlas cluster (or local MongoDB instance)
- API keys for: Azure AI Document Intelligence, Google Gemini AI

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Skillence.git
cd Skillence
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Google Gemini AI
GEMINI_API=your-gemini-api-key
GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent

# Azure AI Document Intelligence
DOCINTEL_API=your-azure-doc-intel-key
DOCINTEL_ENDPOINT=https://your-resource.cognitiveservices.azure.com/

# JWT Authentication
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id

# O*NET API (optional, for data enrichment)
ONET_API_KEY=your-onet-api-key

# Adzuna API (optional, for Job Offer Evaluator)
VITE_ADZUNA_API_KEY=your-adzuna-key
VITE_ADZUNA_APP_ID=your-adzuna-app-id

# Frontend Gemini (for Job Offer Evaluator)
VITE_GEMINI_API_KEY=your-gemini-key

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 4. Frontend Setup

```bash
cd frontend
pnpm install
```

### 5. Train ML Models (Optional — pre-trained checkpoints may be included)

```bash
cd backend

# Train Skill Recommender Autoencoder
python -m app.ml.data.skill_data_processor       # Process training data
python -m app.ml.training.train_skill_recommender # Train model
python -m app.ml.export_to_numpy                  # Export to NumPy

# Train Salary Predictor (or use the automated pipeline)
python run_salary_pipeline.py
```

### 6. Run the Application

**Backend** (Terminal 1):
```bash
cd backend
python main.py
```
The API will be available at `http://localhost:8000`

**Frontend** (Terminal 2):
```bash
cd frontend
pnpm run dev
```
The application will be available at `http://localhost:3000`

---

## Future Roadmap

### Planned ML Models

| Model | Type | Purpose | Status |
|---|---|---|---|
| **Demand Forecaster** | LSTM / Prophet | Predict job market demand trends over time | Planned |

### Planned Features

- Interview preparation module with mock interviews
- Skill gap analysis visualization (UMAP/t-SNE of latent space)
- Save and export salary predictions as PDF reports
- Salary comparison by city/state
- Historical prediction tracking
- Chatbot integration as sidebar popup across all pages
- Mobile application
- Video interview analysis
- Career mentor matching
- ATS compatibility scoring for resumes

### Technical Improvements

- Convert CSV data files to JSON for faster loading
- Expand skill vocabulary with periodic retraining
- Connect to JSearch API for live job posting data
- Add Playwright end-to-end tests
- Docker containerization for deployment
- CI/CD pipeline

---

## License

This project is proprietary. All rights reserved.

---

<p align="center">
  <strong>Skillence</strong> — Where Machine Learning Meets Career Intelligence
</p>
