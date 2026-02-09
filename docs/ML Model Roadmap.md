# 🚀 ML Models Implementation Roadmap
## CareerAI - Real-time Data Integration

**Project Goal:** Implement machine learning models using real-time data from O*NET Web Services API and JSearch API to provide dynamic career guidance, salary predictions, and job matching.

**Timeline:** 4-6 Weeks  
**Last Updated:** February 5, 2026

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Phase 1: API Integration & Data Collection](#phase-1-api-integration--data-collection)
3. [Phase 2: Data Pipeline & Preprocessing](#phase-2-data-pipeline--preprocessing)
4. [Phase 3: ML Model Development](#phase-3-ml-model-development)
5. [Phase 4: Model Training & Evaluation](#phase-4-model-training--evaluation)
6. [Phase 5: Deployment & Integration](#phase-5-deployment--integration)
7. [Phase 6: Testing & Optimization](#phase-6-testing--optimization)
8. [API Documentation](#api-documentation)
9. [Tech Stack](#tech-stack)
10. [Success Metrics](#success-metrics)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        REAL-TIME DATA SOURCES                    │
├──────────────────────────────┬──────────────────────────────────┤
│       O*NET Web Services     │         JSearch API              │
│    (Career & Skills Data)    │    (Job Postings & Salaries)     │
└──────────────┬───────────────┴──────────────┬───────────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA COLLECTION SERVICE                      │
│  - API Clients (onet_client.py, jsearch_client.py)             │
│  - Rate Limiting & Error Handling                               │
│  - Data Validation & Cleaning                                   │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CACHING LAYER (MongoDB/Redis)                 │
│  - Cache Duration: 6-24 hours                                   │
│  - Reduce API calls (Rate limit management)                     │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATA PREPROCESSING PIPELINE                     │
│  - Feature Engineering                                          │
│  - Text Vectorization (TF-IDF, Sentence-BERT)                  │
│  - Skill Extraction & Normalization                             │
│  - Data Aggregation & Merging                                   │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ML MODELS                                │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│   Salary     │  Resume-Job  │  Skill Gap   │  Career Path      │
│  Predictor   │   Matcher    │   Analyzer   │  Recommender      │
│  (XGBoost)   │ (BERT/TF-IDF)│  (Similarity)│  (Graph-based)    │
└──────────────┴──────────────┴──────────────┴───────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI ENDPOINTS                           │
│  /api/ml/predict-salary                                         │
│  /api/ml/match-jobs                                             │
│  /api/ml/analyze-skills                                         │
│  /api/ml/recommend-careers                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📅 Phase 1: API Integration & Data Collection
**Duration:** Week 1 (5-7 days)  
**Status:** 🟡 Pending

### 1.1 O*NET Web Services API Integration

#### Tasks:
- [ ] **Register for O*NET API access**
  - Visit: https://services.onetcenter.org/
  - Register and obtain credentials (username & password)
  - Review API documentation
  - Test rate limits (free tier)

- [ ] **Create O*NET Client Service**
  ```
  File: backend/app/services/onet_api_client.py
  ```
  
  **Endpoints to Integrate:**
  - `GET /ws/online/occupations` - List all occupations
  - `GET /ws/online/occupations/{onet_code}` - Occupation details
  - `GET /ws/online/occupations/{onet_code}/summary/skills` - Skills
  - `GET /ws/online/occupations/{onet_code}/summary/knowledge` - Knowledge
  - `GET /ws/online/occupations/{onet_code}/summary/abilities` - Abilities
  - `GET /ws/online/occupations/{onet_code}/summary/technology_skills` - Tech skills

  **Implementation Details:**
  ```python
  class ONetAPIClient:
      def __init__(self):
          self.base_url = "https://services.onetcenter.org/ws/online"
          self.username = os.getenv("ONET_USERNAME")
          self.password = os.getenv("ONET_PASSWORD")
          self.session = requests.Session()
          self.session.auth = HTTPBasicAuth(self.username, self.password)
      
      async def get_occupation_details(self, onet_code: str) -> dict
      async def get_occupation_skills(self, onet_code: str) -> list
      async def get_all_occupations(self) -> list
      async def get_technology_skills(self, onet_code: str) -> list
      async def search_occupations(self, keyword: str) -> list
  ```

- [ ] **Data Schema Design**
  ```
  File: backend/app/models/onet_occupation.py
  ```
  
  ```python
  class ONetOccupation(BaseModel):
      onet_code: str
      title: str
      description: str
      skills: List[ONetSkill]
      knowledge: List[ONetKnowledge]
      abilities: List[ONetAbility]
      technology_skills: List[TechnologySkill]
      education_level: str
      experience_level: str
      last_updated: datetime
  ```

### 1.2 JSearch API Integration

#### Tasks:
- [ ] **Sign up for JSearch API on RapidAPI**
  - Visit: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
  - Subscribe to free tier (500 requests/month)
  - Get API key and host
  - Test endpoints in Postman/Insomnia

- [ ] **Create JSearch Client Service**
  ```
  File: backend/app/services/jsearch_api_client.py
  ```
  
  **Endpoints to Integrate:**
  - `GET /search` - Search jobs by query and location
  - `GET /job-details` - Get detailed job information
  - `GET /estimated-salary` - Get salary estimates

  **Implementation Details:**
  ```python
  class JSearchAPIClient:
      def __init__(self):
          self.base_url = "https://jsearch.p.rapidapi.com"
          self.api_key = os.getenv("JSEARCH_API_KEY")
          self.api_host = "jsearch.p.rapidapi.com"
          self.headers = {
              "X-RapidAPI-Key": self.api_key,
              "X-RapidAPI-Host": self.api_host
          }
      
      async def search_jobs(self, query: str, location: str, num_pages: int = 1) -> dict
      async def get_job_details(self, job_id: str) -> dict
      async def estimate_salary(self, job_title: str, location: str) -> dict
  ```

- [ ] **Data Schema Design**
  ```
  File: backend/app/models/job_posting.py
  ```
  
  ```python
  class JobPosting(BaseModel):
      job_id: str
      job_title: str
      employer_name: str
      location: str
      salary_min: Optional[float]
      salary_max: Optional[float]
      salary_currency: str
      employment_type: str
      required_skills: List[str]
      required_experience: str
      education_required: str
      job_description: str
      apply_link: str
      posted_date: datetime
      source: str  # "jsearch"
      last_fetched: datetime
  ```

### 1.3 Caching & Rate Limiting

- [ ] **Implement Redis Caching**
  ```
  File: backend/app/services/cache_service.py
  ```
  
  - Cache O*NET occupation data: 24 hours
  - Cache JSearch job postings: 6 hours
  - Cache salary estimates: 12 hours
  - Implement cache invalidation strategy

- [ ] **Rate Limiting Strategy**
  - O*NET: No strict limit (free tier)
  - JSearch: 500 requests/month → ~16/day → Use carefully
  - Implement request queue with priority
  - Batch requests when possible

### 1.4 Environment Configuration

- [ ] **Update `.env` file**
  ```env
  # O*NET API
  ONET_USERNAME=your_username
  ONET_PASSWORD=your_password
  ONET_BASE_URL=https://services.onetcenter.org/ws/online
  
  # JSearch API (RapidAPI)
  JSEARCH_API_KEY=your_rapidapi_key
  JSEARCH_API_HOST=jsearch.p.rapidapi.com
  
  # Redis Cache
  REDIS_URL=redis://localhost:6379
  CACHE_DURATION_ONET=86400  # 24 hours
  CACHE_DURATION_JSEARCH=21600  # 6 hours
  ```

**Deliverables:**
- ✅ Working O*NET API client with authentication
- ✅ Working JSearch API client with authentication
- ✅ Redis caching layer implemented
- ✅ Rate limiting implemented
- ✅ Data models defined
- ✅ Unit tests for API clients

---

## 📊 Phase 2: Data Pipeline & Preprocessing
**Duration:** Week 2 (5-7 days)  
**Status:** 🟡 Pending

### 2.1 Data Collection Pipeline

- [ ] **Create Data Collection Jobs**
  ```
  File: backend/app/jobs/data_collection_job.py
  ```
  
  **Jobs:**
  1. **Occupation Data Sync** (Daily)
     - Fetch all O*NET occupations
     - Update occupation details, skills, knowledge
     - Store in MongoDB collection: `onet_occupations`
  
  2. **Job Postings Fetch** (Every 6 hours)
     - Query JSearch for target job titles
     - Keywords: "Data Scientist", "ML Engineer", "Software Engineer", etc.
     - Locations: Major cities (NYC, SF, Seattle, etc.)
     - Store in MongoDB collection: `job_postings`
  
  3. **Salary Data Collection** (Daily)
     - Fetch salary estimates for common job titles
     - Store in MongoDB collection: `salary_data`

- [ ] **Implement Background Task Scheduler**
  ```python
  # Using APScheduler or Celery
  from apscheduler.schedulers.asyncio import AsyncIOScheduler
  
  scheduler = AsyncIOScheduler()
  scheduler.add_job(sync_onet_data, 'cron', hour=2)  # 2 AM daily
  scheduler.add_job(fetch_job_postings, 'interval', hours=6)
  scheduler.start()
  ```

### 2.2 Data Cleaning & Normalization

- [ ] **Skill Extraction & Normalization**
  ```
  File: backend/app/services/skill_normalizer.py
  ```
  
  **Tasks:**
  - Extract skills from job descriptions using NLP
  - Normalize skill names (e.g., "JS" → "JavaScript")
  - Create skill taxonomy/mapping
  - Link JSearch skills to O*NET skills
  
  ```python
  class SkillNormalizer:
      def __init__(self):
          self.skill_mapping = self._load_skill_mapping()
          self.nlp = spacy.load("en_core_web_sm")
      
      def extract_skills_from_text(self, text: str) -> List[str]
      def normalize_skill(self, skill: str) -> str
      def match_to_onet_skills(self, skills: List[str]) -> List[str]
  ```

- [ ] **Salary Data Cleaning**
  ```
  File: backend/app/services/salary_processor.py
  ```
  
  - Convert all salaries to USD
  - Handle salary ranges (min, max, median)
  - Remove outliers (IQR method)
  - Standardize to annual salary
  - Handle missing values

- [ ] **Location Standardization**
  - Normalize city names
  - Extract state/country
  - Add coordinates (for distance calculations)
  - Map to standard location codes

### 2.3 Feature Engineering

- [ ] **Create Feature Engineering Pipeline**
  ```
  File: backend/app/ml/feature_engineering.py
  ```
  
  **Features for Salary Prediction:**
  - `years_experience` (numeric)
  - `education_level_encoded` (ordinal: 0-4)
  - `skill_count` (numeric)
  - `hot_skills_count` (numeric: AI, ML, Cloud, etc.)
  - `location_cost_of_living_index` (numeric)
  - `company_size_encoded` (ordinal: S, M, L)
  - `remote_ratio` (numeric: 0-100)
  - `industry_encoded` (one-hot)
  - `employment_type_encoded` (one-hot)
  - `skill_embeddings` (TF-IDF or BERT vectors: 768-dim)
  
  **Features for Job Matching:**
  - `skill_similarity_score` (cosine similarity)
  - `experience_match_score` (0-1)
  - `education_match_score` (0-1)
  - `location_preference_score` (0-1)
  - `salary_expectation_match` (0-1)
  - `job_description_embedding` (BERT: 768-dim)
  - `resume_embedding` (BERT: 768-dim)

- [ ] **Text Vectorization**
  ```
  File: backend/app/ml/text_vectorizer.py
  ```
  
  **Options:**
  1. **TF-IDF** (Lightweight, fast)
     - For skill matching
     - scikit-learn TfidfVectorizer
  
  2. **Sentence-BERT** (Accurate, semantic)
     - For job description matching
     - sentence-transformers library
     - Model: `all-MiniLM-L6-v2` or `all-mpnet-base-v2`

### 2.4 Data Storage Schema

- [ ] **MongoDB Collections Design**
  
  **Collection: `onet_occupations`**
  ```javascript
  {
    _id: ObjectId,
    onet_code: "15-1252.00",
    title: "Software Developers",
    skills: [
      {name: "Python", level: 4.5, hot_technology: true},
      ...
    ],
    last_updated: ISODate
  }
  ```
  
  **Collection: `job_postings`**
  ```javascript
  {
    _id: ObjectId,
    job_id: "jsearch_123456",
    job_title: "Machine Learning Engineer",
    employer_name: "TechCorp",
    salary_min: 120000,
    salary_max: 180000,
    required_skills: ["Python", "TensorFlow", "AWS"],
    features: {
      experience_years: 3,
      education_level: 3,
      skill_count: 12,
      ...
    },
    posted_date: ISODate,
    last_fetched: ISODate
  }
  ```
  
  **Collection: `ml_training_data`**
  ```javascript
  {
    _id: ObjectId,
    model_type: "salary_predictor",
    features: {...},
    target: 150000,
    source: "jsearch",
    created_at: ISODate
  }
  ```

**Deliverables:**
- ✅ Data collection pipeline running
- ✅ 1000+ job postings collected
- ✅ All O*NET occupations synced
- ✅ Skill normalization working
- ✅ Feature engineering pipeline ready
- ✅ MongoDB schema implemented

---

## 🤖 Phase 3: ML Model Development
**Duration:** Week 3-4 (10-14 days)  
**Status:** 🟡 Pending

### 3.1 Model 1: Salary Prediction
**Priority:** ⭐⭐⭐ HIGH

#### Objective:
Predict expected salary based on job features, skills, location, and experience.

#### Data Requirements:
- **Training Data:** 1000+ job postings with salary information
- **Features:** 30-50 features (see feature engineering)
- **Target:** `salary_median` (numeric)

#### Implementation:

- [ ] **Data Preparation**
  ```
  File: backend/app/ml/models/salary_predictor/data_prep.py
  ```
  
  ```python
  class SalaryDataPreparator:
      def prepare_training_data(self):
          # Fetch job postings with salary info
          # Remove outliers (salary < 20k or > 500k)
          # Handle missing values
          # Split train/val/test (70/15/15)
          # Scale numeric features
          # Encode categorical features
          return X_train, X_val, X_test, y_train, y_val, y_test
  ```

- [ ] **Model Selection & Training**
  ```
  File: backend/app/ml/models/salary_predictor/model.py
  ```
  
  **Models to Compare:**
  1. **XGBoost Regressor** ⭐ Recommended
     - Pros: High accuracy, handles missing data, feature importance
     - Hyperparameters: max_depth, learning_rate, n_estimators
  
  2. **Random Forest Regressor**
     - Pros: Robust, easy to tune
     - Hyperparameters: n_estimators, max_depth, min_samples_split
  
  3. **Neural Network (MLP)**
     - Pros: Can capture complex patterns
     - Architecture: [input] → [128] → [64] → [32] → [1]
  
  ```python
  class SalaryPredictor:
      def __init__(self):
          self.model = xgb.XGBRegressor(
              max_depth=6,
              learning_rate=0.1,
              n_estimators=200,
              objective='reg:squarederror'
          )
          self.feature_scaler = StandardScaler()
          self.label_encoders = {}
      
      def train(self, X_train, y_train, X_val, y_val):
          # Train model
          # Track metrics
          # Save best model
          pass
      
      def predict(self, features: dict) -> float:
          # Preprocess features
          # Make prediction
          # Return salary estimate
          pass
  ```

- [ ] **Hyperparameter Tuning**
  ```python
  from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
  
  param_grid = {
      'max_depth': [4, 6, 8],
      'learning_rate': [0.01, 0.1, 0.3],
      'n_estimators': [100, 200, 300],
      'subsample': [0.8, 0.9, 1.0]
  }
  
  grid_search = GridSearchCV(xgb.XGBRegressor(), param_grid, cv=5, scoring='neg_mean_squared_error')
  ```

- [ ] **Model Evaluation**
  ```
  File: backend/app/ml/models/salary_predictor/evaluation.py
  ```
  
  **Metrics:**
  - **MAE (Mean Absolute Error):** Target < $10,000
  - **RMSE (Root Mean Squared Error):** Target < $15,000
  - **R² Score:** Target > 0.80
  - **MAPE (Mean Absolute Percentage Error):** Target < 10%
  
  **Validation:**
  - Cross-validation (5-fold)
  - Test on different locations
  - Test on different experience levels
  - Feature importance analysis

- [ ] **Model Persistence**
  ```python
  import joblib
  
  # Save model
  joblib.dump(model, 'backend/app/ml/trained_models/salary_predictor_v1.pkl')
  
  # Save metadata
  metadata = {
      'model_version': '1.0',
      'training_date': datetime.now(),
      'training_samples': len(X_train),
      'features': feature_names,
      'metrics': {'mae': 8500, 'rmse': 12000, 'r2': 0.85}
  }
  ```

### 3.2 Model 2: Resume-Job Matching
**Priority:** ⭐⭐⭐ HIGH

#### Objective:
Calculate similarity score between user's resume/profile and job postings.

#### Data Requirements:
- **User Data:** Skills, experience, education from resume
- **Job Data:** Job description, required skills from JSearch
- **Embeddings:** BERT sentence embeddings

#### Implementation:

- [ ] **Embedding Generation**
  ```
  File: backend/app/ml/models/job_matcher/embeddings.py
  ```
  
  ```python
  from sentence_transformers import SentenceTransformer
  
  class JobMatchEmbedder:
      def __init__(self):
          self.model = SentenceTransformer('all-MiniLM-L6-v2')
      
      def embed_resume(self, resume_data: dict) -> np.ndarray:
          # Combine skills, experience, education into text
          # Generate embedding (384-dim vector)
          pass
      
      def embed_job(self, job_data: dict) -> np.ndarray:
          # Combine job description, requirements into text
          # Generate embedding
          pass
  ```

- [ ] **Similarity Calculation**
  ```
  File: backend/app/ml/models/job_matcher/matcher.py
  ```
  
  ```python
  class JobMatcher:
      def __init__(self):
          self.embedder = JobMatchEmbedder()
          self.skill_normalizer = SkillNormalizer()
      
      def calculate_match_score(self, resume: dict, job: dict) -> dict:
          # 1. Skill similarity (40% weight)
          skill_score = self._skill_similarity(resume['skills'], job['required_skills'])
          
          # 2. Semantic similarity (30% weight)
          resume_embedding = self.embedder.embed_resume(resume)
          job_embedding = self.embedder.embed_job(job)
          semantic_score = cosine_similarity([resume_embedding], [job_embedding])[0][0]
          
          # 3. Experience match (15% weight)
          exp_score = self._experience_match(resume['experience'], job['years_experience'])
          
          # 4. Education match (15% weight)
          edu_score = self._education_match(resume['education'], job['education_required'])
          
          # Weighted score
          total_score = (skill_score * 0.4 + 
                        semantic_score * 0.3 + 
                        exp_score * 0.15 + 
                        edu_score * 0.15)
          
          return {
              'total_score': total_score * 100,  # 0-100
              'skill_match': skill_score * 100,
              'semantic_match': semantic_score * 100,
              'experience_match': exp_score * 100,
              'education_match': edu_score * 100,
              'matched_skills': [...],
              'missing_skills': [...]
          }
  ```

- [ ] **Testing & Validation**
  - Test with sample resumes
  - Validate against known good/bad matches
  - Tune weights for optimal results

### 3.3 Model 3: Skill Gap Analyzer
**Priority:** ⭐⭐ MEDIUM

#### Objective:
Identify missing skills for target career path using O*NET data.

#### Implementation:

- [ ] **Skill Gap Detection**
  ```
  File: backend/app/ml/models/skill_analyzer/gap_analyzer.py
  ```
  
  ```python
  class SkillGapAnalyzer:
      def __init__(self):
          self.onet_client = ONetAPIClient()
      
      async def analyze_gap(self, user_skills: List[str], target_onet_code: str) -> dict:
          # 1. Fetch required skills for target occupation
          required_skills = await self.onet_client.get_occupation_skills(target_onet_code)
          
          # 2. Normalize user skills
          normalized_user_skills = [self.normalize(s) for s in user_skills]
          
          # 3. Compare
          matched_skills = []
          missing_skills = []
          
          for skill in required_skills:
              if skill['name'] in normalized_user_skills:
                  matched_skills.append(skill)
              else:
                  missing_skills.append(skill)
          
          # 4. Prioritize by importance
          missing_skills.sort(key=lambda x: x['importance'], reverse=True)
          
          return {
              'match_percentage': len(matched_skills) / len(required_skills) * 100,
              'matched_skills': matched_skills,
              'missing_skills': missing_skills[:10],  # Top 10
              'recommended_learning_resources': self._get_learning_resources(missing_skills)
          }
  ```

### 3.4 Model 4: Career Path Recommender (Enhanced)
**Priority:** ⭐⭐ MEDIUM

#### Objective:
Recommend career paths based on user profile using O*NET similarity graph.

#### Implementation:

- [ ] **Career Similarity Graph**
  ```
  File: backend/app/ml/models/career_recommender/similarity_graph.py
  ```
  
  ```python
  class CareerSimilarityGraph:
      def __init__(self):
          self.graph = nx.Graph()
          self._build_graph()
      
      def _build_graph(self):
          # Nodes: O*NET occupations
          # Edges: Skill overlap (weight = similarity score)
          occupations = self.fetch_all_occupations()
          
          for i, occ1 in enumerate(occupations):
              for occ2 in occupations[i+1:]:
                  similarity = self._calculate_skill_overlap(occ1, occ2)
                  if similarity > 0.3:  # Threshold
                      self.graph.add_edge(occ1['onet_code'], occ2['onet_code'], weight=similarity)
      
      def find_similar_careers(self, current_career: str, top_k: int = 10) -> List[str]:
          # Find nearest neighbors in graph
          neighbors = nx.neighbors(self.graph, current_career)
          # Sort by edge weight
          # Return top_k
          pass
  ```

- [ ] **Recommendation Engine**
  ```python
  class CareerRecommender:
      def __init__(self):
          self.graph = CareerSimilarityGraph()
          self.job_matcher = JobMatcher()
      
      def recommend_careers(self, user_profile: dict, top_k: int = 10) -> List[dict]:
          # 1. Find user's current career match
          # 2. Find similar careers in graph
          # 3. Calculate match score for each
          # 4. Rank by score + demand (from JSearch)
          # 5. Return top_k recommendations
          pass
  ```

**Deliverables:**
- ✅ Salary prediction model trained (R² > 0.80)
- ✅ Job matching algorithm implemented
- ✅ Skill gap analyzer working
- ✅ Career recommender enhanced
- ✅ All models saved and versioned
- ✅ Model evaluation reports

---

## 🎯 Phase 4: Model Training & Evaluation
**Duration:** Week 4 (3-5 days)  
**Status:** 🟡 Pending

### 4.1 Training Scripts

- [ ] **Create Training Pipelines**
  ```
  File: backend/scripts/train_models.py
  ```
  
  ```python
  async def train_all_models():
      logger.info("Starting model training pipeline...")
      
      # 1. Salary Predictor
      logger.info("Training salary predictor...")
      salary_trainer = SalaryPredictorTrainer()
      salary_metrics = await salary_trainer.train()
      
      # 2. Job Matcher (Embedding generation)
      logger.info("Generating job embeddings...")
      matcher = JobMatcher()
      await matcher.precompute_job_embeddings()
      
      # 3. Skill Gap Analyzer (Pre-cache O*NET data)
      logger.info("Caching O*NET skills...")
      gap_analyzer = SkillGapAnalyzer()
      await gap_analyzer.cache_onet_skills()
      
      # 4. Career Recommender Graph
      logger.info("Building career similarity graph...")
      recommender = CareerRecommender()
      await recommender.build_similarity_graph()
      
      logger.info("All models trained successfully!")
      return {
          'salary_predictor': salary_metrics,
          'job_matcher': 'embeddings_generated',
          'skill_analyzer': 'onet_cached',
          'career_recommender': 'graph_built'
      }
  ```

### 4.2 Model Evaluation & Validation

- [ ] **Comprehensive Testing**
  ```
  File: backend/tests/test_ml_models.py
  ```
  
  **Test Cases:**
  1. **Salary Predictor:**
     - Predict salaries for known jobs (validation set)
     - Check predictions are within reasonable range
     - Test edge cases (very low/high experience)
  
  2. **Job Matcher:**
     - Test with sample resume vs job postings
     - Validate scores make intuitive sense
     - Check matched_skills extraction
  
  3. **Skill Gap Analyzer:**
     - Test with sample user profile
     - Verify missing skills are actually missing
     - Check prioritization logic
  
  4. **Career Recommender:**
     - Test with various user profiles
     - Verify recommended careers are relevant
     - Check diversity of recommendations

- [ ] **Performance Benchmarking**
  - Measure prediction latency (target: < 200ms)
  - Test throughput (requests per second)
  - Memory usage profiling
  - API response time

### 4.3 Model Monitoring Setup

- [ ] **Logging & Metrics**
  ```
  File: backend/app/ml/monitoring.py
  ```
  
  ```python
  class ModelMonitor:
      def log_prediction(self, model_name: str, input_features: dict, prediction: any, latency: float):
          # Log to MongoDB
          prediction_log = {
              'model': model_name,
              'version': MODEL_VERSION,
              'input': input_features,
              'output': prediction,
              'latency_ms': latency,
              'timestamp': datetime.now()
          }
          db.prediction_logs.insert_one(prediction_log)
      
      def get_model_stats(self, model_name: str, days: int = 7) -> dict:
          # Average latency
          # Prediction count
          # Error rate
          pass
  ```

**Deliverables:**
- ✅ Training scripts automated
- ✅ All models evaluated and validated
- ✅ Performance benchmarks documented
- ✅ Monitoring system in place

---

## 🚀 Phase 5: Deployment & Integration
**Duration:** Week 5 (5-7 days)  
**Status:** 🟡 Pending

### 5.1 FastAPI Endpoints

- [ ] **Create ML Router**
  ```
  File: backend/app/routers/ml_models.py
  ```
  
  ```python
  from fastapi import APIRouter, Depends, HTTPException
  from app.ml.models import SalaryPredictor, JobMatcher, SkillGapAnalyzer, CareerRecommender
  
  router = APIRouter()
  
  # Initialize models (singleton pattern)
  salary_predictor = SalaryPredictor()
  job_matcher = JobMatcher()
  skill_analyzer = SkillGapAnalyzer()
  career_recommender = CareerRecommender()
  
  @router.post("/predict-salary")
  async def predict_salary(request: SalaryPredictionRequest, user_id: str = Depends(get_current_user_id)):
      """
      Predict expected salary based on job features.
      
      Request Body:
      {
          "job_title": "Machine Learning Engineer",
          "location": "San Francisco, CA",
          "experience_years": 5,
          "education_level": "Master",
          "skills": ["Python", "TensorFlow", "AWS"],
          "employment_type": "Full-time"
      }
      
      Response:
      {
          "predicted_salary": 165000,
          "salary_range": {"min": 140000, "max": 190000},
          "confidence": 0.87,
          "factors": {
              "high_value_skills": ["TensorFlow", "AWS"],
              "location_factor": 1.4,
              "experience_factor": 1.2
          }
      }
      """
      try:
          prediction = await salary_predictor.predict(request.dict())
          return prediction
      except Exception as e:
          logger.error(f"Salary prediction error: {e}")
          raise HTTPException(status_code=500, detail=str(e))
  
  @router.post("/match-jobs")
  async def match_jobs(request: JobMatchRequest, user_id: str = Depends(get_current_user_id)):
      """
      Find and rank jobs that match user's profile.
      
      Request Body:
      {
          "user_profile_id": "user_123",
          "location_preference": "Remote",
          "min_salary": 100000,
          "max_results": 20
      }
      
      Response:
      {
          "matched_jobs": [
              {
                  "job_id": "jsearch_123",
                  "job_title": "Senior ML Engineer",
                  "company": "TechCorp",
                  "match_score": 92,
                  "skill_match": 88,
                  "semantic_match": 95,
                  "salary": 150000,
                  "location": "Remote",
                  "matched_skills": ["Python", "PyTorch"],
                  "missing_skills": ["Kubernetes"],
                  "apply_link": "https://..."
              },
              ...
          ]
      }
      """
      try:
          # Fetch user profile
          user_profile = await get_user_profile(user_id)
          
          # Fetch relevant jobs from JSearch
          jobs = await fetch_relevant_jobs(request.location_preference, request.min_salary)
          
          # Calculate match scores
          matched_jobs = []
          for job in jobs:
              match_result = job_matcher.calculate_match_score(user_profile, job)
              if match_result['total_score'] >= 60:  # Threshold
                  matched_jobs.append({
                      **job,
                      **match_result
                  })
          
          # Sort by match score
          matched_jobs.sort(key=lambda x: x['total_score'], reverse=True)
          
          return {'matched_jobs': matched_jobs[:request.max_results]}
      except Exception as e:
          logger.error(f"Job matching error: {e}")
          raise HTTPException(status_code=500, detail=str(e))
  
  @router.post("/analyze-skill-gap")
  async def analyze_skill_gap(request: SkillGapRequest, user_id: str = Depends(get_current_user_id)):
      """
      Analyze skill gaps for target career.
      
      Request Body:
      {
          "target_career": "Machine Learning Engineer",
          "target_onet_code": "15-1252.00"
      }
      
      Response:
      {
          "match_percentage": 72,
          "matched_skills": [
              {"name": "Python", "level": 4.5, "user_level": 4.0},
              ...
          ],
          "missing_skills": [
              {"name": "Deep Learning", "importance": "critical", "level": 4.5},
              ...
          ],
          "learning_roadmap": {
              "phase_1": {...},
              "phase_2": {...}
          }
      }
      """
      try:
          user_profile = await get_user_profile(user_id)
          gap_analysis = await skill_analyzer.analyze_gap(
              user_profile['skills']['technical'],
              request.target_onet_code
          )
          return gap_analysis
      except Exception as e:
          logger.error(f"Skill gap analysis error: {e}")
          raise HTTPException(status_code=500, detail=str(e))
  
  @router.get("/recommend-careers")
  async def recommend_careers(user_id: str = Depends(get_current_user_id), top_k: int = 10):
      """
      Recommend career paths based on user profile.
      
      Response:
      {
          "recommendations": [
              {
                  "onet_code": "15-1252.00",
                  "title": "Software Developers",
                  "match_score": 88,
                  "skill_overlap": 75,
                  "average_salary": 120000,
                  "job_openings": 1523,
                  "transition_difficulty": "medium",
                  "missing_skills_count": 3
              },
              ...
          ]
      }
      """
      try:
          user_profile = await get_user_profile(user_id)
          recommendations = await career_recommender.recommend_careers(user_profile, top_k)
          return {'recommendations': recommendations}
      except Exception as e:
          logger.error(f"Career recommendation error: {e}")
          raise HTTPException(status_code=500, detail=str(e))
  
  @router.get("/model-info")
  async def get_model_info():
      """Get information about deployed ML models."""
      return {
          'models': [
              {
                  'name': 'salary_predictor',
                  'version': '1.0',
                  'status': 'active',
                  'metrics': salary_predictor.get_metrics()
              },
              {
                  'name': 'job_matcher',
                  'version': '1.0',
                  'status': 'active'
              },
              {
                  'name': 'skill_analyzer',
                  'version': '1.0',
                  'status': 'active'
              },
              {
                  'name': 'career_recommender',
                  'version': '1.0',
                  'status': 'active'
              }
          ]
      }
  ```

- [ ] **Register ML Router**
  ```python
  # In backend/main.py
  from app.routers import ml_models
  
  app.include_router(ml_models.router, prefix="/api/ml", tags=["machine-learning"])
  ```

### 5.2 Frontend Integration

- [ ] **Create ML Service Client**
  ```
  File: frontend/src/services/mlService.js
  ```
  
  ```javascript
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  export const mlService = {
      async predictSalary(jobDetails) {
          const response = await fetch(`${API_BASE_URL}/api/ml/predict-salary`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${getToken()}`
              },
              body: JSON.stringify(jobDetails)
          });
          return response.json();
      },
      
      async matchJobs(preferences) {
          const response = await fetch(`${API_BASE_URL}/api/ml/match-jobs`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${getToken()}`
              },
              body: JSON.stringify(preferences)
          });
          return response.json();
      },
      
      async analyzeSkillGap(targetCareer) {
          const response = await fetch(`${API_BASE_URL}/api/ml/analyze-skill-gap`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${getToken()}`
              },
              body: JSON.stringify(targetCareer)
          });
          return response.json();
      },
      
      async getCareerRecommendations() {
          const response = await fetch(`${API_BASE_URL}/api/ml/recommend-careers`, {
              headers: {
                  'Authorization': `Bearer ${getToken()}`
              }
          });
          return response.json();
      }
  };
  ```

- [ ] **Create New Frontend Components**
  
  **1. Salary Estimator Widget**
  ```
  File: frontend/src/components/ML/SalaryEstimator.jsx
  ```
  
  **2. Job Match Dashboard**
  ```
  File: frontend/src/components/ML/JobMatchDashboard.jsx
  ```
  
  **3. Skill Gap Visualization**
  ```
  File: frontend/src/components/ML/SkillGapChart.jsx
  ```
  
  **4. Enhanced Career Recommendations**
  ```
  Update: frontend/src/components/Career Path Recommendation/CareerPathRecommendation.jsx
  ```

### 5.3 Database Migration

- [ ] **Create New Collections**
  ```javascript
  // MongoDB collections to add
  - ml_training_data
  - prediction_logs
  - job_postings_cache
  - onet_occupations_cache
  - model_metadata
  ```

- [ ] **Add Indexes**
  ```javascript
  db.job_postings_cache.createIndex({ job_title: 1, location: 1 });
  db.job_postings_cache.createIndex({ posted_date: -1 });
  db.job_postings_cache.createIndex({ last_fetched: 1 }, { expireAfterSeconds: 21600 }); // 6 hours TTL
  
  db.onet_occupations_cache.createIndex({ onet_code: 1 });
  db.onet_occupations_cache.createIndex({ last_updated: 1 }, { expireAfterSeconds: 86400 }); // 24 hours TTL
  
  db.prediction_logs.createIndex({ timestamp: -1 });
  db.prediction_logs.createIndex({ model: 1, timestamp: -1 });
  ```

**Deliverables:**
- ✅ All ML endpoints deployed
- ✅ Frontend integrated
- ✅ Database migrations complete
- ✅ End-to-end testing passed

---

## 🧪 Phase 6: Testing & Optimization
**Duration:** Week 6 (3-5 days)  
**Status:** 🟡 Pending

### 6.1 Comprehensive Testing

- [ ] **Unit Tests**
  - Test each model's prediction logic
  - Test data preprocessing functions
  - Test API clients (O*NET, JSearch)
  - Coverage target: > 80%

- [ ] **Integration Tests**
  - Test full prediction pipeline
  - Test API endpoints
  - Test caching behavior
  - Test error handling

- [ ] **User Acceptance Testing**
  - Test with real user profiles
  - Validate predictions make sense
  - Gather feedback on accuracy
  - Test UI/UX flows

### 6.2 Performance Optimization

- [ ] **Model Optimization**
  - Model quantization (if using neural networks)
  - Feature selection (remove low-importance features)
  - Batch prediction support
  - Caching frequent predictions

- [ ] **API Optimization**
  - Response caching (Redis)
  - Async processing for slow operations
  - Connection pooling
  - Request batching

- [ ] **Frontend Optimization**
  - Lazy loading components
  - Debounce API calls
  - Loading states
  - Error boundaries

### 6.3 Documentation

- [ ] **API Documentation**
  - Swagger/OpenAPI docs
  - Example requests/responses
  - Error codes and handling
  - Rate limits

- [ ] **User Documentation**
  - How to use ML features
  - What predictions mean
  - Accuracy disclaimers
  - FAQ section

**Deliverables:**
- ✅ All tests passing
- ✅ Performance optimized
- ✅ Documentation complete
- ✅ Ready for production

---

## 📚 API Documentation

### O*NET Web Services API

**Base URL:** `https://services.onetcenter.org/ws/online`  
**Authentication:** HTTP Basic Auth (username + password)  
**Rate Limit:** No strict limit (free tier)  
**Documentation:** https://services.onetcenter.org/reference/

**Key Endpoints:**

| Endpoint | Description | Example |
|----------|-------------|---------|
| `GET /occupations` | List all occupations | `/occupations?start=1&end=20` |
| `GET /occupations/{onet_code}` | Occupation details | `/occupations/15-1252.00` |
| `GET /occupations/{onet_code}/summary/skills` | Skills for occupation | `/occupations/15-1252.00/summary/skills` |
| `GET /occupations/{onet_code}/summary/technology_skills` | Tech skills | `/occupations/15-1252.00/summary/technology_skills` |
| `GET /search?keyword={keyword}` | Search occupations | `/search?keyword=software` |

**Response Format:**
```json
{
  "career": {
    "code": "15-1252.00",
    "title": "Software Developers, Applications",
    "description": "Develop, create, and modify...",
    "tags": {...}
  }
}
```

### JSearch API (RapidAPI)

**Base URL:** `https://jsearch.p.rapidapi.com`  
**Authentication:** RapidAPI Key (Header: `X-RapidAPI-Key`)  
**Rate Limit:** 500 requests/month (free tier)  
**Documentation:** https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch

**Key Endpoints:**

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /search` | Search jobs | `query`, `page`, `num_pages`, `date_posted` |
| `GET /job-details` | Job details | `job_id` |
| `GET /estimated-salary` | Salary estimate | `job_title`, `location` |

**Request Example:**
```bash
curl --request GET \
  --url 'https://jsearch.p.rapidapi.com/search?query=Machine%20Learning%20Engineer%20in%20New%20York' \
  --header 'X-RapidAPI-Host: jsearch.p.rapidapi.com' \
  --header 'X-RapidAPI-Key: YOUR_KEY'
```

**Response Format:**
```json
{
  "status": "OK",
  "data": [
    {
      "job_id": "abc123",
      "employer_name": "TechCorp",
      "job_title": "Machine Learning Engineer",
      "job_employment_type": "FULLTIME",
      "job_min_salary": 120000,
      "job_max_salary": 180000,
      "job_required_skills": ["Python", "TensorFlow"],
      "job_description": "We are looking for...",
      "job_apply_link": "https://..."
    }
  ]
}
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Core language |
| **FastAPI** | 0.104+ | Web framework |
| **scikit-learn** | 1.3+ | ML algorithms (Random Forest, preprocessing) |
| **XGBoost** | 2.0+ | Gradient boosting (salary prediction) |
| **sentence-transformers** | 2.2+ | BERT embeddings (job matching) |
| **spaCy** | 3.7+ | NLP (skill extraction) |
| **pandas** | 2.1+ | Data manipulation |
| **numpy** | 1.24+ | Numerical computing |
| **joblib** | 1.3+ | Model serialization |
| **redis** | 5.0+ | Caching layer |
| **motor** | 3.3+ | MongoDB async driver |
| **requests** | 2.31+ | API calls |
| **aiohttp** | 3.9+ | Async API calls |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | UI framework |
| **Recharts** | 2.x | Data visualization |
| **Axios** | 1.x | API client |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **MongoDB** | Primary database |
| **Redis** | Caching layer |
| **Docker** | Containerization (optional) |

---

## 📊 Success Metrics

### Model Performance

| Model | Metric | Target | Current |
|-------|--------|--------|---------|
| **Salary Predictor** | MAE | < $10,000 | TBD |
| | RMSE | < $15,000 | TBD |
| | R² Score | > 0.80 | TBD |
| **Job Matcher** | Avg Match Score | 70-85 | TBD |
| | Relevance Rate | > 80% | TBD |
| **Skill Gap Analyzer** | Accuracy | > 90% | TBD |
| **Career Recommender** | User Satisfaction | > 4/5 | TBD |

### System Performance

| Metric | Target | Current |
|--------|--------|---------|
| **API Response Time** | < 200ms (p95) | TBD |
| **Prediction Latency** | < 100ms | TBD |
| **Cache Hit Rate** | > 80% | TBD |
| **API Uptime** | > 99% | TBD |

### Business Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **User Engagement** | +30% vs static data | TBD |
| **Feature Adoption** | > 60% of active users | TBD |
| **Prediction Accuracy** | > 85% user satisfaction | TBD |

---

## 📝 Installation & Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add:
ONET_USERNAME=your_onet_username
ONET_PASSWORD=your_onet_password
JSEARCH_API_KEY=your_rapidapi_key
REDIS_URL=redis://localhost:6379
```

### 3. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally (Windows)
# Download from https://github.com/microsoftarchive/redis/releases
```

### 4. Initialize Data

```bash
# Sync O*NET data
python backend/scripts/sync_onet_data.py

# Fetch initial job postings
python backend/scripts/fetch_jobs.py

# Train models
python backend/scripts/train_models.py
```

### 5. Run Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 6. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 Next Steps After Completion

1. **Monitor Model Performance**
   - Track prediction accuracy over time
   - Collect user feedback
   - Identify drift and retrain when needed

2. **Expand Data Sources**
   - Add more job APIs (LinkedIn, Glassdoor)
   - Integrate BLS API for economic data
   - Add Google Trends for skill popularity

3. **Advanced Features**
   - Skill demand forecasting (time series)
   - Career transition probability model
   - Personalized learning recommendations (RL)
   - Salary negotiation advisor

4. **Optimization**
   - Model compression for faster inference
   - GPU acceleration for embeddings
   - Distributed training for larger datasets

5. **Professor Presentation**
   - Demo live predictions
   - Show real-time data updates
   - Compare static vs. real-time results
   - Discuss challenges and solutions

---

## 🔗 Useful Resources

- **O*NET Web Services:** https://services.onetcenter.org/
- **JSearch API:** https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- **scikit-learn Docs:** https://scikit-learn.org/
- **XGBoost Guide:** https://xgboost.readthedocs.io/
- **Sentence Transformers:** https://www.sbert.net/
- **FastAPI Docs:** https://fastapi.tiangolo.com/

---

## 📞 Support & Questions

For any questions or issues during implementation:
1. Check API documentation
2. Review error logs
3. Test with sample data first
4. Validate data preprocessing

**Good luck with your implementation! 🚀**

