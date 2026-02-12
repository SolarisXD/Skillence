# Model 3: Skill Recommender Autoencoder

> **Status**: Implemented and trained  
> **Type**: Denoising Autoencoder (Deep Learning)  
> **Framework**: PyTorch 2.10 (CPU)  
> **Last trained**: February 2026  

---

## 1. Overview

The Skill Recommender is a **denoising autoencoder** that learns co-occurrence patterns among skills across 15,000+ career profiles. Given a user's current skill set and an optional target career, it reconstructs the full skill vector and ranks previously-unknown skills by reconstruction confidence.

**Key value**: The ML model recommends *which skills to learn*, while Gemini AI builds the *learning roadmap* around those ML-prioritised skills. Best of both worlds — data-driven ranking + contextual planning.

---

## 2. Architecture

```
Encoder:  input(466) → 256 → 128 → 64 → latent(32)
Decoder:  latent(32) → 64 → 128 → 256 → output(466)
```

- Each hidden layer uses **BatchNorm → LeakyReLU(0.2) → Dropout**
- Final output uses **Sigmoid** (inputs are binary [0,1])
- Training uses **denoising** — 30% input corruption, model reconstructs original
- Loss: **Binary Cross-Entropy (BCE)**
- Optimizer: **Adam** with ReduceLROnPlateau scheduler

### Why an Autoencoder?

| Approach | Pros | Cons |
|----------|------|------|
| **Autoencoder** ✓ | Learns latent skill relationships, handles sparse data, interpretable confidence scores | Needs sufficient training data |
| Collaborative filtering | Good for user-item matrices | Requires user interaction history we don't have |
| Reinforcement Learning | Adaptive | No reward signal, too complex for this use case |

---

## 3. Data Pipeline

### Sources

| Source | Records | What it provides |
|--------|---------|-----------------|
| Technology Skills.xlsx | 32,681 rows → ~11,616 hot techs | Technology names per occupation (filtered to Hot/In-Demand) |
| Skills.xlsx | 62,580 rows | Core skills per occupation (Importance ≥ 3.5) |
| Knowledge.xlsx | 59,004 rows | Knowledge areas per occupation (Importance ≥ 3.5) |
| onet_occupations_data.json | 894 entries | Required/optional skills per O*NET occupation |
| ai_job_dataset.csv | 15,000 rows | Required skills per job posting (24 unique skills) |

### Processing

1. **Vocabulary assembly**: Merge skill names from all 5 sources → deduplicate → lowercase → filter to ≥ 2 chars → sort alphabetically → assign indices
2. **Binary vector construction**: For each occupation (O*NET) and each job posting (CSV), create a binary vector of size `vocab_size` marking which skills are present
3. **Output**: `(15,923 × 466)` binary matrix + vocabulary index

### Final Stats

```
Vocabulary size : 466 skills
Training samples: 15,923 (923 O*NET occupations + 15,000 CSV jobs)
Sparsity        : 98.5%
```

### Data Processor Location

```
backend/app/ml/data/skill_data_processor.py
```

Run: `python -m app.ml.data.skill_data_processor` (from `backend/`)

---

## 4. Training

### Hyperparameters

| Parameter | Value |
|-----------|-------|
| Latent dimension | 32 |
| Dropout | 0.30 |
| Corruption rate | 0.30 |
| Learning rate | 1e-3 (with ReduceLROnPlateau) |
| Weight decay | 1e-5 |
| Batch size | 128 |
| Train/Val split | 85% / 15% |
| Early stopping patience | 20 epochs |

### Results

```
Final epoch     : 174 / 200 (early stopped)
Best val_loss   : 0.0061
Training time   : ~340s (CPU)
Train samples   : 13,535
Val samples     : 2,388
```

### Training Script

```
backend/app/ml/training/train_skill_recommender.py
```

Run: `python -m app.ml.training.train_skill_recommender` (from `backend/`)

### Checkpoint

```
backend/app/ml/models/checkpoints/best_skill_autoencoder.pt     (model weights + vocab)
backend/app/ml/models/checkpoints/training_metadata.json        (training stats + loss history)
```

---

## 5. Inference

### How It Works

1. Convert user's skill list → binary vector (466-dim)
2. Feed through autoencoder → get reconstruction scores [0, 1] for all 466 skills
3. If target career provided → load that occupation's vector, add 30% boost to career-relevant skills
4. Filter out skills user already knows
5. Rank remaining skills by combined score → return top-K

### Example

```python
from app.ml.inference.skill_recommender import get_skill_recommender

sr = get_skill_recommender()
recs = sr.recommend(
    current_skills=["python", "sql", "tensorflow"],
    target_occupation_code="15-1252.00",  # Software Developers
    top_k=10,
)
# Returns: [
#   {"skill": "pytorch",    "confidence": 0.3696, "source": "career_target"},
#   {"skill": "tableau",    "confidence": 0.3615, "source": "career_target"},
#   {"skill": "linux",      "confidence": 0.3575, "source": "career_target"},
#   ...
# ]
```

### Inference Service

```
backend/app/ml/inference/skill_recommender.py
```

Uses a **lazy-loaded singleton** — the model loads once on first request and persists in memory.

---

## 6. API Endpoints

### `POST /api/ml/recommend-skills`

Authenticated endpoint. Returns ML-ranked skill recommendations.

**Request:**
```json
{
  "current_skills": ["python", "sql", "machine learning"],
  "target_occupation_code": "15-1252.00",
  "top_k": 15
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    { "skill": "pytorch", "confidence": 0.37, "source": "career_target", "is_known": false }
  ],
  "matched_input_skills": ["python", "sql"],
  "vocab_size": 466,
  "message": "Generated 15 recommendations from 2 matched input skills."
}
```

### `GET /api/ml/health`

Public. Returns model readiness status.

```json
{
  "model_loaded": true,
  "vocab_size": 466,
  "checkpoint": "best_skill_autoencoder.pt"
}
```

---

## 7. Integration with Learning Roadmap

The ML recommender is integrated into `learning_plan_service.py`:

1. **User requests learning plan** → `generate_learning_plan()` is called
2. Service extracts user's technical skills from their profile
3. **ML recommender** produces top-20 ranked skill suggestions
4. These are injected into the O*NET requirements dict as `ml_recommended_skills`
5. **Gemini AI** receives both O*NET data + ML rankings and generates the full roadmap
6. Final response includes `ml_skill_recommendations` array + `ml_powered: true` flag

```
User Profile → ML Recommender → Gemini AI → Learning Roadmap
     ↓               ↓               ↓              ↓
  Skills       Ranked skills    Contextual     Full plan
  extracted    by model         roadmap        with ML recs
```

If the ML model is unavailable, the system falls back gracefully to the existing O*NET-only + Gemini pipeline.

---

## 8. Frontend Display

The ML recommendations appear as a dedicated section below the Learning Roadmap phases in the Career Path Recommendation page:

- **"ML Enhanced" badge** on the learning plan header
- **"Skill Recommendations" card** with ML-Powered badge
- **Grid of skill cards** showing rank, name, confidence bar, and career-match tag
- Top 12 skills displayed, ranked by confidence
- Career-relevant skills visually highlighted with purple left border

CSS classes: `.ml-recommendations-section`, `.ml-skill-card`, `.ml-confidence-bar`, `.ml-powered-badge`

---

## 9. File Structure

```
backend/app/ml/
├── __init__.py
├── data/
│   ├── __init__.py
│   ├── skill_data_processor.py      ← Data pipeline
│   └── processed/
│       ├── skill_vectors.npy        ← (15923, 466) binary matrix
│       ├── skill_index.json         ← skill → column index
│       ├── occupation_labels.json   ← row → occupation code
│       └── vocab_metadata.json      ← summary stats
├── models/
│   ├── __init__.py
│   ├── skill_autoencoder.py         ← PyTorch model definition
│   └── checkpoints/
│       ├── best_skill_autoencoder.pt    ← Trained weights + vocab
│       └── training_metadata.json       ← Training stats
├── training/
│   ├── __init__.py
│   └── train_skill_recommender.py   ← Training script
└── inference/
    ├── __init__.py
    └── skill_recommender.py         ← Inference service (singleton)

backend/app/routers/
└── ml_predictions.py                ← FastAPI endpoints

frontend/src/components/Career Path Recommendation/
├── CareerPathRecommendation.jsx     ← Updated with ML section
└── CareerPathRecommendation.css     ← Updated with ML styles
```

---

## 10. Retraining

To retrain after adding new data:

```bash
cd backend

# 1. Re-process data (if new Excel/CSV files added)
python -m app.ml.data.skill_data_processor

# 2. Retrain model
python -m app.ml.training.train_skill_recommender

# 3. Restart the backend server (model loads on first request)
```

The training script uses early stopping and saves only the best checkpoint, so retraining is safe and idempotent.

---

## 11. Limitations & Future Work

- **Vocabulary coverage**: 466 skills — user skills not in the vocab are ignored during inference. Future: expand vocab with more data sources.
- **Cold start**: If a user has zero skills matching the vocab, the model returns generic high-frequency recommendations. Future: incorporate experience level weighting.
- **Static data**: Model trains on O*NET + CSV snapshots. Future: connect to JSearch API for live job postings and periodic retraining.
- **Interpretability**: The latent space embeddings could be used for skill-similarity visualizations. Future: add UMAP/t-SNE visualization endpoint.