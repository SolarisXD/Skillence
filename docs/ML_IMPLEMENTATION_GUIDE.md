# 🚀 ML Implementation Guide - CareerAI
## Complete Machine Learning Integration Documentation

**Project:** CareerAI - AI-Powered Career Intelligence Platform  
**Status:** Salary Predictor ✅ Complete | Demand Forecaster ⏳ Pending | Skill Recommender ⏳ Pending  
**Last Updated:** February 8, 2026

---

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Implemented Models](#implemented-models)
4. [Pending Models](#pending-models)
5. [Data Pipeline](#data-pipeline)
6. [API Integration](#api-integration)
7. [Frontend Integration](#frontend-integration)
8. [Tech Stack](#tech-stack)
9. [Implementation Phases](#implementation-phases)
10. [Success Metrics](#success-metrics)

---

## 📊 Executive Summary

CareerAI uses **3 Deep Learning models** trained on real data from **O*NET API** (occupation/skill data) and **JSearch API** (real-time job postings) to provide personalized career guidance:

| # | Model | Type | Status | Purpose |
|---|-------|------|--------|---------|
| 1 | **Salary Predictor** | PyTorch MLP → NumPy | ✅ **Complete** | Predict personalized salary based on skills, experience, location |
| 2 | **Demand Forecaster** | LSTM/Prophet | ⏳ Pending | Forecast job market trends over time |
| 3 | **Skill Recommender** | Autoencoder | ⏳ Pending | Recommend next skills to learn based on career goals |

**Key Principles:**
- Models trained **locally** and served via NumPy for fast inference
- Data collected via APIs, cached in MongoDB/files
- Focus on **real-time insights** over static averages
- Each model enhances an existing feature

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
├──────────────────────────────┬──────────────────────────────────┤
│       O*NET Web Services     │         JSearch API              │
│    (Career & Skills Data)    │    (Job Postings & Salaries)     │
└──────────────┬───────────────┴──────────────┬───────────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA COLLECTION SERVICE                      │
│  - CSV Processing (15K+ job records)                            │
│  - Feature Engineering (34 features)                            │
│  - Skill Vocabulary Building (24 core skills)                   │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TRAINING PIPELINE (PyTorch)                   │
│  - Model: MLP Lite (512→256→128→64→1)                          │
│  - Epochs: 50 | Early Stopping: Patience 10                     │
│  - Performance: R² = 0.726 | RMSE = 0.539                       │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  INFERENCE ENGINE (NumPy Only)                   │
│  - Export: PyTorch → NumPy (193.5 KB weights)                   │
│  - Inference: 50-100ms per prediction                           │
│  - Confidence: Multi-factor (5 components)                      │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                              │
│  - POST /api/job-trends/predict-salary                          │
│  - GET  /api/job-trends/salary-trends-ml/{job_title}           │
│  - GET  /api/job-trends/ml-status                              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND                               │
│  - Component: SalaryPredictor.jsx (with inline API)            │
│  - Features: Skills autocomplete, Confidence meter              │
│  - Visualizations: Recharts, SVG icons                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Model 1: Salary Predictor (COMPLETE)

### Overview
Deep neural network that predicts personalized salaries based on user profile.

**Status:** ✅ **Fully Implemented and Deployed**  
**Type:** MLP (Multi-Layer Perceptron)  
**Framework:** PyTorch 2.x (training) → NumPy (inference)  

### Architecture
```
Input(34) → 512 → 256 → 128 → 64 → Output(1)

- BatchNorm + ReLU + Dropout after each layer
- Skip connections for gradient flow
- Final layer: Linear (no activation for regression)
```

### Features (34 total)
| Feature Type | Count | Description |
|--------------|-------|-------------|
| Skills | 24 | Binary vectors (python, sql, aws, etc.) |
| Experience | 1 | Years of experience (normalized) |
| Location | 1 | Label encoded city |
| Industry | 1 | Label encoded industry |
| Company Size | 1 | Small/Medium/Large |
| Education | 1 | Degree level |
| Employment Type | 1 | Full-time/Part-time/Contract |
| Experience Level | 4 | Entry/Mid/Senior/Lead |

### Performance Metrics
- **R² Score:** 0.7258
- **RMSE:** 0.5389
- **MAE:** 0.3868
- **Training Time:** 67.5 seconds (50 epochs)
- **Inference Time:** 50-100ms per prediction

### Confidence Calculation (Multi-Factor)
```python
confidence = (
    skill_confidence * 0.40 +      # 40% - Skills match
    experience_confidence * 0.15 +  # 15% - Experience level
    location_confidence * 0.15 +    # 15% - Location known
    industry_confidence * 0.15 +    # 15% - Industry known
    optional_confidence * 0.15      # 15% - Optional details
)
```

### API Endpoints
1. **POST** `/api/job-trends/predict-salary`
   - Input: Profile data (skills, experience, location, etc.)
   - Output: Predicted salary, confidence, matched skills, market comparison

2. **GET** `/api/job-trends/salary-trends-ml/{job_title}`
   - Input: Job title, optional months parameter
   - Output: Historical salary trends for visualization

3. **GET** `/api/job-trends/ml-status`
   - Output: Model status, accuracy, features count

### Frontend Integration
**Component:** `frontend/src/components/Job Trend/current/components/SalaryPredictor.jsx`

**Structure (Consolidated - 3 files only):**
```
components/
├── SalaryPredictor.jsx    ← Component + API functions (759 lines)
└── SalaryPredictor.css    ← Complete styling (1047 lines)
docs/
└── SALARY_PREDICTOR_README.md ← Documentation
```

**Features:**
- ✅ Skills autocomplete (24 ML-recognized skills)
- ✅ Circular confidence meter with breakdown
- ✅ Market comparison statistics
- ✅ Salary trends chart (Recharts)
- ✅ SVG icons (no emojis)
- ✅ Multi-factor confidence display
- ✅ Responsive design with dark mode

**Usage:**
1. Navigate to Job Trends → Salary Predictor tab
2. Add skills from autocomplete dropdown
3. Fill experience, location, industry
4. Click "Predict Salary"
5. View prediction with confidence breakdown

---

## ⏳ Model 2: Demand Forecaster (PENDING)

### Overview
Time-series model to forecast job market demand trends.

**Status:** ⏳ **Not Yet Implemented**  
**Type:** LSTM or Prophet (Time-Series)  
**Purpose:** Predict future job posting volumes and salary trends

### Planned Architecture
```
Option 1 - LSTM:
Input(sequence_length, features) → LSTM(128) → LSTM(64) → Dense(32) → Output

Option 2 - Prophet:
- Decompose: Trend + Seasonality + Holiday effects
- Additive model with changepoints
```

### Features to Predict
- Monthly job posting volume
- Average salary trends
- Skills demand evolution
- Geographic demand shifts

### Data Requirements
- Historical job posting data (12+ months)
- Seasonal patterns
- External factors (economic indicators)

### Planned Integration
- **Dashboard:** "Market Forecast" section
- **Visualizations:** Line charts with confidence intervals
- **Time Range:** 3, 6, 12 months forward

---

## ⏳ Model 3: Skill Recommender (PENDING)

### Overview
Autoencoder that learns skill co-occurrence patterns for personalized recommendations.

**Status:** ⏳ **Not Yet Implemented**  
**Type:** Denoising Autoencoder  
**Purpose:** Recommend next skills to learn based on current profile + career goal

### Planned Architecture
```
Encoder:  Input(466) → 256 → 128 → 64 → Latent(32)
Decoder:  Latent(32) → 64 → 128 → 256 → Output(466)

- Denoising: 30% input corruption during training
- Loss: Binary Cross-Entropy
- Output: Reconstruction confidence for each skill
```

### How It Works
1. User provides current skills + target job title
2. Model reconstructs full skill vector from latent space
3. Rank unlearned skills by reconstruction confidence
4. Gemini AI builds learning roadmap around top recommendations

### Data Sources
- O*NET Skills.xlsx (62K+ skill-occupation pairs)
- Technology Skills.xlsx (32K+ tech-occupation pairs)
- Knowledge.xlsx (59K+ knowledge-occupation pairs)

### Planned Integration
- **Learning Roadmap:** Replace static skill lists with ML recommendations
- **Output:** Top 5-10 skills with confidence scores
- **Context:** Gemini wraps recommendations in personalized learning plan

---

## 📦 Data Pipeline

### Current Data Sources
**Salary Predictor:**
- **ai_job_dataset.csv** (15K records)
- **ai_job_dataset1.csv** (15K records)
- Combined: 30K job postings → 24K after cleaning

**Future Models:**
- **O*NET API:** Career and skill metadata
- **JSearch API:** Real-time job postings (rate-limited)
- **MongoDB Cache:** 6-24 hour cache for API responses

### Processing Pipeline
```python
# 1. Load and clean data
raw_data = load_csv_files()
cleaned_data = filter_valid_salaries(raw_data)  # Remove zeros, outliers

# 2. Build vocabularies
skill_vocab = build_skill_vocabulary(min_frequency=5)  # 24 core skills
location_encoder = LabelEncoder(locations)
industry_encoder = LabelEncoder(industries)

# 3. Feature engineering
features = encode_skills(skills, skill_vocab)  # Binary vectors
features += normalize_experience(years)         # 0-1 range
features += encode_categorical(location, industry, etc.)

# 4. Train/Val/Test split
train: 70%, val: 15%, test: 15%

# 5. Training
model = train_pytorch_model(epochs=50, patience=10)

# 6. Export to NumPy
export_to_numpy(model, "salary_model_weights.npz")
```

---

## 🔌 API Integration

### Backend Structure
```
backend/app/
├── ml/
│   ├── data/
│   │   ├── fetch_api_data.py          # Future: API clients
│   │   ├── skill_data_processor.py    # Feature engineering
│   │   └── processed/                 # Training datasets
│   ├── inference/
│   │   └── salary_inference.py        # NumPy inference engine
│   ├── models/
│   │   └── salary_autoencoder.py      # PyTorch model definitions
│   └── training/
│       └── train_salary_model.py      # Training pipeline
├── routers/
│   └── job_trends.py                  # API endpoints
└── services/
    └── job_trend_service.py           # Business logic
```

### Key Classes

**SalaryInference (NumPy Only):**
```python
class SalaryInference:
    def __init__(self):
        self.weights = np.load("weights.npz")
        self.skill_vocab = load_json("feature_info.json")
    
    def predict(self, profile: dict) -> dict:
        # Returns: predicted_salary, confidence, matched_skills, etc.
```

**JobTrendService:**
```python
class JobTrendService:
    def predict_salary_ml(self, profile_data):
        # Calls SalaryInference.predict()
        # Adds market comparison stats
        # Returns formatted response
```

---

## 🎨 Frontend Integration

### Component Structure (Consolidated Pattern)
```
components/Job Trend/current/
├── JobTrendDashboard.jsx              # Tab navigation
├── JobTrendDashboard.css              # Tab styles
└── components/
    ├── SalaryPredictor.jsx            # Salary predictor + inline API
    ├── SalaryPredictor.css            # Complete styling
    ├── [Future] DemandForecaster.jsx  # With inline API
    └── [Future] SkillRecommender.jsx  # With inline API
```

**Pattern for Future Models:**
- ✅ **No separate API service file** - integrate API functions inside component
- ✅ **SVG icons** instead of emojis
- ✅ **3 files per model:** Component.jsx, Component.css, README.md
- ✅ **Unified styling:** Match existing design system

### Tab Navigation
```jsx
const [activeTab, setActiveTab] = useState('dashboard');

<div className="tab-navigation">
  <button onClick={() => setActiveTab('dashboard')}>
    <ChartIcon /> Dashboard
  </button>
  <button onClick={() => setActiveTab('salary-predictor')}>
    <MoneyIcon /> Salary Predictor
  </button>
  {/* Future: Demand Forecaster, Skill Recommender tabs */}
</div>
```

---

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI
- **ML Training:** PyTorch 2.x (CPU)
- **ML Inference:** NumPy (lightweight, no PyTorch at runtime)
- **Data Processing:** pandas, scikit-learn
- **Database:** MongoDB (caching)

### Frontend
- **Framework:** React
- **Visualization:** Recharts
- **Styling:** CSS3 with CSS variables
- **Icons:** Inline SVG components
- **State:** React Hooks (useState, useEffect, useRef)

### DevOps
- **Version Control:** Git
- **Package Manager:** pip (backend), npm/pnpm (frontend)
- **Environment:** Python 3.9+, Node.js 18+

---

## 📅 Implementation Phases

### ✅ Phase 1: Salary Predictor (COMPLETE)
**Duration:** 2 weeks  
**Status:** ✅ Done

- [x] Data collection and cleaning (30K records)
- [x] Feature engineering (34 features, 24 skills)
- [x] Model training (R² = 0.726)
- [x] NumPy export (193.5 KB)
- [x] Backend API integration (3 endpoints)
- [x] Frontend component (659 lines)
- [x] Skills autocomplete dropdown
- [x] Confidence meter redesign
- [x] Multi-factor confidence calculation
- [x] Documentation and testing

### ⏳ Phase 2: Demand Forecaster (PENDING)
**Duration:** 2-3 weeks  
**Priority:** Next

- [ ] Collect historical job posting data
- [ ] Build time-series dataset
- [ ] Train LSTM/Prophet model
- [ ] Export for inference
- [ ] Create API endpoints
- [ ] Build frontend component
- [ ] Add visualization charts
- [ ] Testing and validation

### ⏳ Phase 3: Skill Recommender (PENDING)
**Duration:** 2-3 weeks  
**Priority:** After Forecaster

- [ ] Process O*NET skill data
- [ ] Build autoencoder architecture
- [ ] Train denoising model
- [ ] Export to NumPy
- [ ] Integrate with Gemini AI
- [ ] Create API endpoints
- [ ] Build frontend interface
- [ ] Testing and validation

### 🔄 Phase 4: Retraining Pipeline (FUTURE)
**Duration:** 1 week  
**Priority:** After all models complete

- [ ] Automated data collection scripts
- [ ] Scheduled retraining (monthly)
- [ ] Model versioning system
- [ ] A/B testing framework
- [ ] Performance monitoring dashboard

---

## 📊 Success Metrics

### Salary Predictor (Current)
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| R² Score | > 0.70 | 0.726 | ✅ Pass |
| Inference Time | < 200ms | 50-100ms | ✅ Pass |
| Model Size | < 500KB | 193.5KB | ✅ Pass |
| User Confidence | > 60% | 70%+ avg | ✅ Pass |

### Demand Forecaster (Target)
- MAPE (Mean Absolute Percentage Error) < 15%
- 3-month forecast accuracy > 80%
- Inference time < 100ms

### Skill Recommender (Target)
- Top-5 recommendation accuracy > 70%
- User satisfaction (relevance) > 75%
- Inference time < 50ms

---

## 🔧 Development Commands

### Training
```powershell
# Salary Predictor
cd backend
$env:PYTHONPATH="C:\path\to\backend"
python -m app.ml.training.train_salary_model --epochs 50 --model lite --patience 10

# Future: Demand Forecaster
python -m app.ml.training.train_demand_model --sequence_length 12 --epochs 100

# Future: Skill Recommender
python -m app.ml.training.train_skill_recommender --latent_dim 32 --epochs 80
```

### Backend Server
```powershell
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Dev Server
```powershell
cd frontend
npm run dev  # or pnpm run dev
```

---

## 📚 Documentation Files

### Current Documentation
1. **SALARY_PREDICTOR_README.md** - Complete Salary Predictor guide
2. **ML_IMPLEMENTATION_GUIDE.md** (this file) - Comprehensive ML strategy

### Archived/Replaced
- ~~ML Model Roadmap.md~~ → Merged into this guide
- ~~Roadmap for ML with API.md~~ → Merged into this guide
- ~~Model 3 - Skill Recommender.md~~ → Merged into this guide
- ~~SALARY_PREDICTOR_INTEGRATION.md~~ → Merged into SALARY_PREDICTOR_README.md
- ~~salaryPredictorAPI.js~~ → Integrated into SalaryPredictor.jsx

---

## 🎯 Next Steps

### Immediate (Week 1-2)
1. ✅ Complete Salary Predictor consolidation
2. ⏳ Start Demand Forecaster data collection
3. ⏳ Design LSTM architecture
4. ⏳ Set up training pipeline

### Short-term (Week 3-4)
1. ⏳ Train Demand Forecaster model
2. ⏳ Build API endpoints
3. ⏳ Create frontend component
4. ⏳ Testing and validation

### Long-term (Week 5-6)
1. ⏳ Implement Skill Recommender
2. ⏳ Integrate with Gemini AI
3. ⏳ Complete end-to-end testing
4. ⏳ Performance optimization

---

## 💡 Best Practices

### Model Development
1. **Start simple**: Test with lite models before full architectures
2. **Validate early**: Check predictions make sense before scaling
3. **Export smartly**: NumPy inference avoids PyTorch DLL issues on Windows
4. **Monitor performance**: Track R², RMSE, inference time

### Frontend Integration
1. **Consolidate API calls**: Inline API functions in components
2. **Use SVG icons**: Avoid emoji for professional look
3. **Keep it simple**: 3 files per model (Component, CSS, README)
4. **Reuse patterns**: Copy structure from SalaryPredictor

### Data Pipeline
1. **Cache aggressively**: Reduce API calls with 6-24 hour cache
2. **Validate inputs**: Filter invalid data early
3. **Version datasets**: Track which data trained which model
4. **Monitor quality**: Log data issues for retraining

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Model loading slow  
**Solution:** Use lazy loading, cache model in memory after first load

**Issue:** Confidence always zero  
**Solution:** Check multi-factor calculation, ensure all components sum correctly

**Issue:** Skills not recognized  
**Solution:** Display autocomplete with 24 valid skills, warn on unmatched

**Issue:** NumPy export fails  
**Solution:** Ensure PyTorch model on CPU before export, check weight shapes

**Issue:** API CORS errors  
**Solution:** Add frontend origin to FastAPI CORS middleware

---

## 📞 Support & Questions

For implementation questions:
1. Check respective README files
2. Review training logs
3. Inspect API response messages
4. Test with sample data first

---

**Last Updated:** February 8, 2026  
**Status:** Phase 1 Complete ✅ | Phase 2-3 Pending ⏳  
**Next Milestone:** Demand Forecaster implementation

---

**Good luck with Phases 2 & 3! 🚀**
