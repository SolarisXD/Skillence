"""
Salary Predictor Inference Service (NumPy-only — no PyTorch at runtime).

Loads exported NumPy weights and reproduces the forward pass with pure NumPy.
This avoids c10.dll / WinError issues when PyTorch is loaded in FastAPI on Windows.

Public API:
    - predict_salary(skills, experience, location, industry, ...)
    - predict_salary_batch(profiles)
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any

import numpy as np

logger = logging.getLogger(__name__)

_CHECKPOINT_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "../models/checkpoints")
)
_DATA_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "../data/processed")
)

# BatchNorm epsilon (PyTorch default)
_BN_EPS = 1e-5


# ---------------------------------------------------------------------------
# NumPy layer helpers (eval mode)
# ---------------------------------------------------------------------------

def _linear(x: np.ndarray, weight: np.ndarray, bias: np.ndarray) -> np.ndarray:
    """Fully-connected layer: y = x @ W^T + b"""
    return x @ weight.T + bias


def _batchnorm(
    x: np.ndarray,
    running_mean: np.ndarray,
    running_var: np.ndarray,
    weight: np.ndarray,
    bias: np.ndarray,
) -> np.ndarray:
    """BatchNorm1d in eval mode."""
    return weight * (x - running_mean) / np.sqrt(running_var + _BN_EPS) + bias


def _relu(x: np.ndarray) -> np.ndarray:
    """ReLU activation."""
    return np.maximum(0, x)


class SalaryPredictorInference:
    """Inference wrapper for Salary Predictor (NumPy-only)."""
    
    def __init__(self):
        self.input_dim: int = 0
        self.dropout_rate: float = 0.3
        self.is_lite: bool = False
        self._weights: Dict[str, np.ndarray] = {}
        self._loaded = False
        
        # Feature encodings
        self.feature_info: Dict[str, Any] = {}
        self.skill_vocab: Dict[str, int] = {}
        self.salary_mean: float = 0.0
        self.salary_std: float = 1.0
    
    def load(self, checkpoint_path: str = None) -> bool:
        """Load NumPy checkpoint and feature info."""
        npz_path = checkpoint_path or os.path.join(
            _CHECKPOINT_DIR, "salary_predictor_numpy.npz"
        )
        
        if not os.path.exists(npz_path):
            logger.warning(f"NumPy checkpoint not found: {npz_path}")
            return False
        
        try:
            # Load weights
            data = dict(np.load(npz_path, allow_pickle=False))
            
            # Extract metadata
            meta = data.pop("_meta")
            self.input_dim = int(meta[0])
            self.dropout_rate = float(meta[1])
            self.is_lite = bool(meta[2])
            
            self._weights = data
            
            # Load feature info
            feature_info_path = os.path.join(_DATA_DIR, "salary_feature_info.json")
            if not os.path.exists(feature_info_path):
                logger.error(f"Feature info not found: {feature_info_path}")
                return False
            
            with open(feature_info_path, 'r') as f:
                self.feature_info = json.load(f)
            
            self.skill_vocab = self.feature_info['skill_vocab']
            self.salary_mean = self.feature_info['salary_mean']
            self.salary_std = self.feature_info['salary_std']
            
            self._loaded = True
            
            model_type = "lite" if self.is_lite else "full"
            logger.info(f"✅ Loaded Salary Predictor ({model_type})")
            logger.info(f"   Input dim: {self.input_dim}")
            logger.info(f"   Skills in vocab: {len(self.skill_vocab)}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False
    
    @property
    def is_loaded(self) -> bool:
        return self._loaded
    
    def _encode_features(
        self,
        skills: List[str],
        experience_years: float,
        location: str,
        industry: str,
        company_size: str = "Unknown",
        education: str = "Bachelor's Degree",
        employment_type: str = "Full-time",
        experience_level: str = "Mid-Level"
    ) -> np.ndarray:
        """Encode input features into feature vector."""
        
        # 1. Skills (binary vector)
        skill_vector = np.zeros(len(self.skill_vocab))
        for skill in skills:
            skill_lower = skill.lower().strip()
            if skill_lower in self.skill_vocab:
                skill_vector[self.skill_vocab[skill_lower]] = 1.0
        
        # 2. Experience (normalized)
        exp_mean = self.feature_info['experience_mean']
        exp_std = self.feature_info['experience_std']
        experience_norm = (experience_years - exp_mean) / exp_std if exp_std > 0 else 0.0
        
        # 3. Location (encoded)
        location_classes = self.feature_info['location_classes']
        location_idx = location_classes.index(location) if location in location_classes else 0
        
        # 4. Industry (encoded)
        industry_classes = self.feature_info['industry_classes']
        industry_idx = industry_classes.index(industry) if industry in industry_classes else 0
        
        # 5. Company size (encoded)
        company_size_classes = self.feature_info['company_size_classes']
        company_size_idx = company_size_classes.index(company_size) if company_size in company_size_classes else 0
        
        # 6. Education (encoded)
        education_classes = self.feature_info['education_classes']
        education_idx = education_classes.index(education) if education in education_classes else 0
        
        # 7. Employment type (encoded)
        employment_type_classes = self.feature_info['employment_type_classes']
        employment_type_idx = employment_type_classes.index(employment_type) if employment_type in employment_type_classes else 0
        
        # 8. Experience level (one-hot)
        exp_level_columns = self.feature_info['exp_level_columns']
        exp_level_vector = np.zeros(len(exp_level_columns))
        exp_level_name = f"exp_level_{experience_level}"
        if exp_level_name in exp_level_columns:
            exp_level_idx = exp_level_columns.index(exp_level_name)
            exp_level_vector[exp_level_idx] = 1.0
        
        # Combine all features
        features = np.concatenate([
            skill_vector,
            [experience_norm],
            [location_idx],
            [industry_idx],
            [company_size_idx],
            [education_idx],
            [employment_type_idx],
            exp_level_vector
        ])
        
        return features
    
    def _forward_lite(self, x: np.ndarray) -> np.ndarray:
        """Forward pass for lite model."""
        # network.0: Linear
        x = _linear(x, self._weights['network.0.weight'], self._weights['network.0.bias'])
        # network.1: BatchNorm
        x = _batchnorm(
            x,
            self._weights['network.1.running_mean'],
            self._weights['network.1.running_var'],
            self._weights['network.1.weight'],
            self._weights['network.1.bias']
        )
        # network.2: ReLU
        x = _relu(x)
        # Dropout is no-op in eval mode
        
        # network.4: Linear
        x = _linear(x, self._weights['network.4.weight'], self._weights['network.4.bias'])
        # network.5: BatchNorm
        x = _batchnorm(
            x,
            self._weights['network.5.running_mean'],
            self._weights['network.5.running_var'],
            self._weights['network.5.weight'],
            self._weights['network.5.bias']
        )
        # network.6: ReLU
        x = _relu(x)
        
        # network.8: Linear
        x = _linear(x, self._weights['network.8.weight'], self._weights['network.8.bias'])
        # network.9: BatchNorm
        x = _batchnorm(
            x,
            self._weights['network.9.running_mean'],
            self._weights['network.9.running_var'],
            self._weights['network.9.weight'],
            self._weights['network.9.bias']
        )
        # network.10: ReLU
        x = _relu(x)
        
        # network.12: Linear (output)
        x = _linear(x, self._weights['network.12.weight'], self._weights['network.12.bias'])
        
        return x
    
    def _forward_full(self, x: np.ndarray) -> np.ndarray:
        """Forward pass for full model with skip connections."""
        identity = x
        
        # Layer 1
        out = _linear(x, self._weights['fc1.weight'], self._weights['fc1.bias'])
        out = _batchnorm(
            out,
            self._weights['bn1.running_mean'],
            self._weights['bn1.running_var'],
            self._weights['bn1.weight'],
            self._weights['bn1.bias']
        )
        out = _relu(out)
        
        # Layer 2 with skip connection
        out = _linear(out, self._weights['fc2.weight'], self._weights['fc2.bias'])
        out = _batchnorm(
            out,
            self._weights['bn2.running_mean'],
            self._weights['bn2.running_var'],
            self._weights['bn2.weight'],
            self._weights['bn2.bias']
        )
        skip = _linear(identity, self._weights['skip1.weight'], self._weights['skip1.bias'])
        out = out + skip
        out = _relu(out)
        
        identity2 = out
        
        # Layer 3
        out = _linear(out, self._weights['fc3.weight'], self._weights['fc3.bias'])
        out = _batchnorm(
            out,
            self._weights['bn3.running_mean'],
            self._weights['bn3.running_var'],
            self._weights['bn3.weight'],
            self._weights['bn3.bias']
        )
        out = _relu(out)
        
        # Layer 4 with skip connection
        out = _linear(out, self._weights['fc4.weight'], self._weights['fc4.bias'])
        out = _batchnorm(
            out,
            self._weights['bn4.running_mean'],
            self._weights['bn4.running_var'],
            self._weights['bn4.weight'],
            self._weights['bn4.bias']
        )
        skip2 = _linear(identity2, self._weights['skip2.weight'], self._weights['skip2.bias'])
        out = out + skip2
        out = _relu(out)
        
        # Output
        out = _linear(out, self._weights['fc_out.weight'], self._weights['fc_out.bias'])
        
        return out
    
    def predict_salary(
        self,
        skills: List[str],
        experience_years: float,
        location: str,
        industry: str,
        company_size: str = "Unknown",
        education: str = "Bachelor's Degree",
        employment_type: str = "Full-time",
        experience_level: str = "Mid-Level"
    ) -> Dict[str, Any]:
        """
        Predict salary for a given profile.
        
        Returns:
            Dictionary with:
                - predicted_salary: float (in USD)
                - confidence: float (0-1, multi-factor score)
                - matched_skills: List[str] (recognized by model)
                - unmatched_skills: List[str] (not in model vocabulary)
                - total_skills_provided: int
                - confidence_breakdown: dict (individual confidence factors)
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")
        
        # Encode features
        features = self._encode_features(
            skills, experience_years, location, industry,
            company_size, education, employment_type, experience_level
        )
        
        # Add batch dimension
        features = features.reshape(1, -1)
        
        # Forward pass
        if self.is_lite:
            pred_norm = self._forward_lite(features)[0, 0]
        else:
            pred_norm = self._forward_full(features)[0, 0]
        
        # Denormalize
        predicted_salary = float(pred_norm * self.salary_std + self.salary_mean)
        
        # Calculate comprehensive confidence score
        matched_skills = [s for s in skills if s.lower().strip() in self.skill_vocab]
        unmatched_skills = [s for s in skills if s.lower().strip() not in self.skill_vocab]
        
        # Multi-factor confidence calculation:
        # 1. Skills match (40% weight) - Capped at 0.4 for matched skills
        skill_confidence = min(0.4, len(matched_skills) / 10 * 0.4)
        
        # 2. Has valid experience (15% weight)
        exp_confidence = 0.15 if experience_years > 0 else 0.0
        
        # 3. Has valid location (15% weight)
        location_confidence = 0.15 if location and location in self.feature_info['location_classes'] else 0.05
        
        # 4. Has valid industry (15% weight)
        industry_confidence = 0.15 if industry and industry in self.feature_info['industry_classes'] else 0.05
        
        # 5. Has optional details (15% weight)
        optional_confidence = 0.0
        if company_size in self.feature_info['company_size_classes']:
            optional_confidence += 0.05
        if education in self.feature_info['education_classes']:
            optional_confidence += 0.05
        if employment_type in self.feature_info['employment_type_classes']:
            optional_confidence += 0.05
        
        # Total confidence (0-1 scale)
        confidence = skill_confidence + exp_confidence + location_confidence + industry_confidence + optional_confidence
        confidence = min(1.0, confidence)  # Cap at 1.0
        
        return {
            "predicted_salary": max(0, predicted_salary),  # Ensure non-negative
            "confidence": confidence,
            "matched_skills": matched_skills,
            "unmatched_skills": unmatched_skills,
            "total_skills_provided": len(skills),
            "confidence_breakdown": {
                "skills": skill_confidence,
                "experience": exp_confidence,
                "location": location_confidence,
                "industry": industry_confidence,
                "optional_details": optional_confidence
            }
        }


# Singleton instance
_salary_predictor: Optional[SalaryPredictorInference] = None


def get_salary_predictor() -> SalaryPredictorInference:
    """Get or create the singleton salary predictor instance."""
    global _salary_predictor
    
    if _salary_predictor is None:
        _salary_predictor = SalaryPredictorInference()
        _salary_predictor.load()
    
    return _salary_predictor
