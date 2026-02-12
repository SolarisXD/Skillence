"""
Salary Data Processor for Salary Predictor Model.

Processes job trend data and prepares features for salary prediction:
- Skills (one-hot encoded from skill vocabulary)
- Years of experience (normalized)
- Location (label encoded)
- Industry (label encoded)
- Company size (label encoded)
- Education level (label encoded)
- Employment type (label encoded)

Output artifacts (saved to backend/app/ml/data/processed/):
    - salary_train_X.npy       : (N, F) feature matrix
    - salary_train_y.npy       : (N,) salary targets (normalized)
    - salary_feature_info.json : feature names, encodings, normalizers
    - salary_metadata.json     : stats, feature importance info
"""

import os
import json
import logging
from typing import Dict, List, Tuple, Any
from collections import Counter

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_CAREER_DATA = os.path.normpath(os.path.join(_BASE_DIR, "../../career_data"))
_JOB_DATA_DIR = os.path.join(_CAREER_DATA, "job_trend_data")
_OUTPUT_DIR = os.path.join(_BASE_DIR, "processed")

os.makedirs(_OUTPUT_DIR, exist_ok=True)


class SalaryDataProcessor:
    """Process job data and prepare features for salary prediction."""

    def __init__(self):
        self.skill_vocab: Dict[str, int] = {}
        self.location_encoder = LabelEncoder()
        self.industry_encoder = LabelEncoder()
        self.company_size_encoder = LabelEncoder()
        self.education_encoder = LabelEncoder()
        self.employment_type_encoder = LabelEncoder()
        self.experience_scaler = StandardScaler()
        self.salary_scaler = StandardScaler()
        
        self.feature_names: List[str] = []
        self.num_features: int = 0

    def load_and_prepare_data(self) -> Tuple[pd.DataFrame, bool]:
        """Load job data CSVs and prepare for processing."""
        try:
            dfs = []
            
            # Load both CSV files
            csv_files = [
                os.path.join(_JOB_DATA_DIR, "ai_job_dataset.csv"),
                os.path.join(_JOB_DATA_DIR, "ai_job_dataset1.csv"),
            ]
            
            for csv_file in csv_files:
                if os.path.exists(csv_file):
                    df = pd.read_csv(csv_file)
                    dfs.append(df)
                    logger.info(f"Loaded {len(df)} rows from {os.path.basename(csv_file)}")
            
            if not dfs:
                logger.error("No job data files found!")
                return None, False
            
            # Combine dataframes
            combined_df = pd.concat(dfs, ignore_index=True)
            logger.info(f"Total rows loaded: {len(combined_df)}")
            
            # Filter out rows with missing or zero salaries
            combined_df = combined_df[combined_df['salary_usd'].notna()]
            combined_df = combined_df[combined_df['salary_usd'] > 0]
            
            logger.info(f"Rows with valid salary: {len(combined_df)}")
            
            if len(combined_df) < 100:
                logger.error("Insufficient data for training!")
                return None, False
            
            return combined_df, True
            
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return None, False

    def _build_skill_vocabulary(self, df: pd.DataFrame) -> Dict[str, int]:
        """Build skill vocabulary from the dataset."""
        all_skills = []
        
        for skills_str in df['required_skills'].dropna():
            if isinstance(skills_str, str):
                skills = [s.strip().lower() for s in skills_str.split(',') if s.strip()]
                all_skills.extend(skills)
        
        # Count skill frequency
        skill_counts = Counter(all_skills)
        
        # Only include skills that appear at least 5 times
        frequent_skills = {skill: idx for idx, (skill, count) in 
                          enumerate(skill_counts.most_common()) if count >= 5}
        
        logger.info(f"Built skill vocabulary: {len(frequent_skills)} skills")
        return frequent_skills

    def _encode_skills(self, skills_str: str) -> np.ndarray:
        """Encode skills string into binary vector."""
        if pd.isna(skills_str) or not isinstance(skills_str, str):
            return np.zeros(len(self.skill_vocab))
        
        skills = [s.strip().lower() for s in skills_str.split(',') if s.strip()]
        vector = np.zeros(len(self.skill_vocab))
        
        for skill in skills:
            if skill in self.skill_vocab:
                vector[self.skill_vocab[skill]] = 1.0
        
        return vector

    def process_and_save(self, test_size: float = 0.15, val_size: float = 0.15) -> bool:
        """Process data and save training artifacts."""
        try:
            # Load data
            df, success = self.load_and_prepare_data()
            if not success:
                return False
            
            logger.info("Building skill vocabulary...")
            self.skill_vocab = self._build_skill_vocabulary(df)
            
            # Prepare features
            logger.info("Encoding features...")
            
            # 1. Skills (binary vectors)
            skill_vectors = np.array([
                self._encode_skills(skills) for skills in df['required_skills']
            ])
            
            # 2. Years of experience (normalized)
            experience = df['years_experience'].fillna(0).values.reshape(-1, 1)
            experience_norm = self.experience_scaler.fit_transform(experience).flatten()
            
            # 3. Location (label encoded)
            locations = df['company_location'].fillna('Unknown').astype(str)
            location_encoded = self.location_encoder.fit_transform(locations).reshape(-1, 1)
            
            # 4. Industry (label encoded)
            industries = df['industry'].fillna('Unknown').astype(str)
            industry_encoded = self.industry_encoder.fit_transform(industries).reshape(-1, 1)
            
            # 5. Company size (label encoded)
            company_sizes = df['company_size'].fillna('Unknown').astype(str)
            company_size_encoded = self.company_size_encoder.fit_transform(company_sizes).reshape(-1, 1)
            
            # 6. Education (label encoded)
            education = df['education_required'].fillna('Unknown').astype(str)
            education_encoded = self.education_encoder.fit_transform(education).reshape(-1, 1)
            
            # 7. Employment type (label encoded)
            employment_types = df['employment_type'].fillna('Unknown').astype(str)
            employment_encoded = self.employment_type_encoder.fit_transform(employment_types).reshape(-1, 1)
            
            # 8. Experience level (one-hot encoded)
            exp_levels = df['experience_level'].fillna('Unknown').astype(str)
            exp_level_dummies = pd.get_dummies(exp_levels, prefix='exp_level')
            
            # Combine all features
            X = np.hstack([
                skill_vectors,                    # Skills (binary)
                experience_norm.reshape(-1, 1),   # Experience (normalized)
                location_encoded,                 # Location (encoded)
                industry_encoded,                 # Industry (encoded)
                company_size_encoded,             # Company size (encoded)
                education_encoded,                # Education (encoded)
                employment_encoded,               # Employment type (encoded)
                exp_level_dummies.values          # Experience level (one-hot)
            ])
            
            # Target: Salary (normalized)
            y = df['salary_usd'].values.reshape(-1, 1)
            y_norm = self.salary_scaler.fit_transform(y).flatten()
            
            logger.info(f"Feature matrix shape: {X.shape}")
            logger.info(f"Target shape: {y_norm.shape}")
            
            # Build feature names
            self.feature_names = (
                [f"skill_{skill}" for skill in sorted(self.skill_vocab.keys())] +
                ["experience_years"] +
                ["location"] +
                ["industry"] +
                ["company_size"] +
                ["education"] +
                ["employment_type"] +
                list(exp_level_dummies.columns)
            )
            self.num_features = X.shape[1]
            
            # Split data
            X_temp, X_test, y_temp, y_test = train_test_split(
                X, y_norm, test_size=test_size, random_state=42
            )
            
            val_size_adjusted = val_size / (1 - test_size)
            X_train, X_val, y_train, y_val = train_test_split(
                X_temp, y_temp, test_size=val_size_adjusted, random_state=42
            )
            
            logger.info(f"Train: {X_train.shape}, Val: {X_val.shape}, Test: {X_test.shape}")
            
            # Save data
            np.save(os.path.join(_OUTPUT_DIR, "salary_train_X.npy"), X_train)
            np.save(os.path.join(_OUTPUT_DIR, "salary_train_y.npy"), y_train)
            np.save(os.path.join(_OUTPUT_DIR, "salary_val_X.npy"), X_val)
            np.save(os.path.join(_OUTPUT_DIR, "salary_val_y.npy"), y_val)
            np.save(os.path.join(_OUTPUT_DIR, "salary_test_X.npy"), X_test)
            np.save(os.path.join(_OUTPUT_DIR, "salary_test_y.npy"), y_test)
            
            # Save feature info
            feature_info = {
                "skill_vocab": self.skill_vocab,
                "location_classes": self.location_encoder.classes_.tolist(),
                "industry_classes": self.industry_encoder.classes_.tolist(),
                "company_size_classes": self.company_size_encoder.classes_.tolist(),
                "education_classes": self.education_encoder.classes_.tolist(),
                "employment_type_classes": self.employment_type_encoder.classes_.tolist(),
                "exp_level_columns": list(exp_level_dummies.columns),
                "experience_mean": float(self.experience_scaler.mean_[0]),
                "experience_std": float(self.experience_scaler.scale_[0]),
                "salary_mean": float(self.salary_scaler.mean_[0]),
                "salary_std": float(self.salary_scaler.scale_[0]),
                "feature_names": self.feature_names,
                "num_features": self.num_features
            }
            
            with open(os.path.join(_OUTPUT_DIR, "salary_feature_info.json"), "w") as f:
                json.dump(feature_info, f, indent=2)
            
            # Save metadata
            metadata = {
                "total_samples": len(X),
                "train_samples": len(X_train),
                "val_samples": len(X_val),
                "test_samples": len(X_test),
                "num_features": self.num_features,
                "num_skills": len(self.skill_vocab),
                "salary_range": {
                    "min": float(df['salary_usd'].min()),
                    "max": float(df['salary_usd'].max()),
                    "mean": float(df['salary_usd'].mean()),
                    "median": float(df['salary_usd'].median())
                }
            }
            
            with open(os.path.join(_OUTPUT_DIR, "salary_metadata.json"), "w") as f:
                json.dump(metadata, f, indent=2)
            
            logger.info("✅ Data processing complete!")
            logger.info(f"   Saved to: {_OUTPUT_DIR}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing data: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Run the salary data processor."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s"
    )
    
    processor = SalaryDataProcessor()
    success = processor.process_and_save()
    
    if success:
        print("\n✅ Salary data processing completed successfully!")
        print(f"📁 Output directory: {_OUTPUT_DIR}")
    else:
        print("\n❌ Data processing failed!")
        return 1
    
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
