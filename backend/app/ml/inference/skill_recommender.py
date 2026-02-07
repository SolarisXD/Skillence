"""
Skill Recommender Inference Service  (NumPy-only — no PyTorch at runtime).

Loads exported NumPy weights produced by ``app.ml.export_to_numpy`` and
reproduces the autoencoder forward pass with pure NumPy operations.
This avoids the ``c10.dll`` / ``[WinError 1114]`` crash that occurs when
PyTorch is loaded inside the FastAPI process on Windows.

Public API is fully backward-compatible with the previous torch-based
implementation.
"""

import os
import json
import logging
from typing import Dict, List, Optional

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


# -----------------------------------------------------------------------
# Pure-numpy layer helpers (eval-mode only — dropout is a no-op)
# -----------------------------------------------------------------------

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
    """BatchNorm1d in eval mode: y = gamma * (x - mu) / sqrt(var + eps) + beta"""
    return weight * (x - running_mean) / np.sqrt(running_var + _BN_EPS) + bias


def _leaky_relu(x: np.ndarray, negative_slope: float = 0.2) -> np.ndarray:
    return np.where(x > 0, x, negative_slope * x)


def _sigmoid(x: np.ndarray) -> np.ndarray:
    # Clip to avoid overflow in exp
    x = np.clip(x, -500, 500)
    return 1.0 / (1.0 + np.exp(-x))


class SkillRecommender:
    """Inference wrapper around the trained Skill Autoencoder (NumPy-only)."""

    def __init__(self):
        self.skill_index: Dict[str, int] = {}   # skill_name -> column idx
        self.index_to_skill: Dict[int, str] = {}  # column idx -> skill_name
        self.input_dim: int = 0
        self.latent_dim: int = 0
        self._weights: Dict[str, np.ndarray] = {}
        self._loaded = False

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------
    def load(self, checkpoint_path: str = None) -> bool:
        """Load the numpy-exported checkpoint.

        Falls back to the ``.npz`` file produced by ``export_to_numpy.py``.
        Returns True on success, False when the file is missing.
        """
        npz_path = checkpoint_path or os.path.join(
            _CHECKPOINT_DIR, "skill_autoencoder_numpy.npz"
        )

        if not os.path.exists(npz_path):
            logger.warning(f"NumPy checkpoint not found: {npz_path}")
            return False

        try:
            data = dict(np.load(npz_path, allow_pickle=False))

            # Metadata
            meta = data.pop("_meta")
            self.input_dim = int(meta[0])
            self.latent_dim = int(meta[1])

            # Skill index (stored as UTF-8 byte array)
            skill_json_bytes = data.pop("_skill_index_json").tobytes()
            self.skill_index = json.loads(skill_json_bytes.decode("utf-8"))
            self.index_to_skill = {v: k for k, v in self.skill_index.items()}

            # Everything else is model weights
            self._weights = data
            self._loaded = True

            logger.info(
                f"Skill Recommender loaded (numpy). vocab={len(self.skill_index)}, "
                f"latent={self.latent_dim}, arrays={len(self._weights)}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to load skill recommender: {e}", exc_info=True)
            return False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    # ------------------------------------------------------------------
    # Forward pass (numpy)
    # ------------------------------------------------------------------
    def _forward(self, x: np.ndarray) -> np.ndarray:
        """Full autoencoder forward pass (encoder + decoder) in eval mode.

        x shape: (1, input_dim)  ->  output shape: (1, input_dim)

        Architecture per direction:
            Linear -> BN -> LeakyReLU -> (Dropout=noop)    x3
            Linear  (encoder end)  /  Linear -> Sigmoid  (decoder end)
        """
        w = self._weights

        # ---------- encoder ----------
        # Block 0:  Linear(input_dim, 256) -> BN(256) -> LeakyReLU
        x = _linear(x, w["enc_linear0_weight"], w["enc_linear0_bias"])
        x = _batchnorm(x, w["enc_bn0_running_mean"], w["enc_bn0_running_var"],
                        w["enc_bn0_weight"], w["enc_bn0_bias"])
        x = _leaky_relu(x)

        # Block 1:  Linear(256, 128) -> BN(128) -> LeakyReLU
        x = _linear(x, w["enc_linear1_weight"], w["enc_linear1_bias"])
        x = _batchnorm(x, w["enc_bn1_running_mean"], w["enc_bn1_running_var"],
                        w["enc_bn1_weight"], w["enc_bn1_bias"])
        x = _leaky_relu(x)

        # Block 2:  Linear(128, 64) -> BN(64) -> LeakyReLU
        x = _linear(x, w["enc_linear2_weight"], w["enc_linear2_bias"])
        x = _batchnorm(x, w["enc_bn2_running_mean"], w["enc_bn2_running_var"],
                        w["enc_bn2_weight"], w["enc_bn2_bias"])
        x = _leaky_relu(x)

        # Block 3 (final encoder):  Linear(64, latent_dim)
        x = _linear(x, w["enc_linear3_weight"], w["enc_linear3_bias"])

        # ---------- decoder ----------
        # Block 0:  Linear(latent_dim, 64) -> BN(64) -> LeakyReLU
        x = _linear(x, w["dec_linear0_weight"], w["dec_linear0_bias"])
        x = _batchnorm(x, w["dec_bn0_running_mean"], w["dec_bn0_running_var"],
                        w["dec_bn0_weight"], w["dec_bn0_bias"])
        x = _leaky_relu(x)

        # Block 1:  Linear(64, 128) -> BN(128) -> LeakyReLU
        x = _linear(x, w["dec_linear1_weight"], w["dec_linear1_bias"])
        x = _batchnorm(x, w["dec_bn1_running_mean"], w["dec_bn1_running_var"],
                        w["dec_bn1_weight"], w["dec_bn1_bias"])
        x = _leaky_relu(x)

        # Block 2:  Linear(128, 256) -> BN(256) -> LeakyReLU
        x = _linear(x, w["dec_linear2_weight"], w["dec_linear2_bias"])
        x = _batchnorm(x, w["dec_bn2_running_mean"], w["dec_bn2_running_var"],
                        w["dec_bn2_weight"], w["dec_bn2_bias"])
        x = _leaky_relu(x)

        # Block 3 (final decoder):  Linear(256, input_dim) -> Sigmoid
        x = _linear(x, w["dec_linear3_weight"], w["dec_linear3_bias"])
        x = _sigmoid(x)

        return x

    def _encode(self, x: np.ndarray) -> np.ndarray:
        """Encoder-only forward pass.  x: (1, input_dim) -> (1, latent_dim)"""
        w = self._weights
        x = _linear(x, w["enc_linear0_weight"], w["enc_linear0_bias"])
        x = _batchnorm(x, w["enc_bn0_running_mean"], w["enc_bn0_running_var"],
                        w["enc_bn0_weight"], w["enc_bn0_bias"])
        x = _leaky_relu(x)
        x = _linear(x, w["enc_linear1_weight"], w["enc_linear1_bias"])
        x = _batchnorm(x, w["enc_bn1_running_mean"], w["enc_bn1_running_var"],
                        w["enc_bn1_weight"], w["enc_bn1_bias"])
        x = _leaky_relu(x)
        x = _linear(x, w["enc_linear2_weight"], w["enc_linear2_bias"])
        x = _batchnorm(x, w["enc_bn2_running_mean"], w["enc_bn2_running_var"],
                        w["enc_bn2_weight"], w["enc_bn2_bias"])
        x = _leaky_relu(x)
        x = _linear(x, w["enc_linear3_weight"], w["enc_linear3_bias"])
        return x

    # ------------------------------------------------------------------
    # Skill vector helpers
    # ------------------------------------------------------------------
    def _skills_to_vector(self, skills: List[str]) -> np.ndarray:
        """Convert a list of skill names to a binary vector."""
        vec = np.zeros(self.input_dim, dtype=np.float32)
        for skill in skills:
            skill_lower = skill.strip().lower()
            if skill_lower in self.skill_index:
                vec[self.skill_index[skill_lower]] = 1.0
        return vec

    def _get_occupation_vector(self, occupation_code: str) -> Optional[np.ndarray]:
        """Look up the pre-computed vector for an occupation code."""
        labels_path = os.path.join(_DATA_DIR, "occupation_labels.json")
        vectors_path = os.path.join(_DATA_DIR, "skill_vectors.npy")

        if not os.path.exists(labels_path) or not os.path.exists(vectors_path):
            return None

        with open(labels_path, "r") as f:
            labels = json.load(f)

        if occupation_code not in labels:
            return None

        idx = labels.index(occupation_code)
        vectors = np.load(vectors_path)
        if idx >= vectors.shape[0]:
            return None

        return vectors[idx]

    # Non-actionable or overly generic skills to suppress in recommendations
    _SUPPRESS_SKILLS = {
        "mathematics", "statistics", "active learning", "active listening",
        "critical thinking", "reading comprehension", "writing", "speaking",
        "monitoring", "social perceptiveness", "coordination", "time management",
        "judgment and decision making", "complex problem solving", "science",
        "instructing", "learning strategies", "administration and management",
        "quality control analysis", "systems evaluation", "systems analysis",
        "negotiation", "persuasion", "service orientation", "management of personnel resources",
        "operations analysis", "technology design", "equipment selection",
        "troubleshooting", "operation monitoring", "operation and control",
        "repairing", "installation", "equipment maintenance",
        "computers and electronics", "microsoft windows", "engineering and technology",
        "telecommunications", "clerical", "programming",
    }
    # O*NET commodity category names (too generic to be useful skills)
    _SUPPRESS_PATTERNS = [
        "development environment software",
        "operating system software",
        "user interface and query software",
        "object or component oriented",
        "file versioning software",
        "web platform development software",
        "analytical or scientific software",
        "presentation software",
        "enterprise resource planning",
        "requirements analysis and design",
        "configuration management software",
        "project management software",
        "content workflow software",
        "transaction security",
        "transaction server",
        "network monitoring software",
        "program testing software",
        "compiler and decompiler software",
        "database management system software",
        "data base user interface",
        "the mathworks matlab",
    ]

    # ------------------------------------------------------------------
    # Core recommendation
    # ------------------------------------------------------------------
    def recommend(
        self,
        current_skills: List[str],
        target_occupation_code: str = None,
        top_k: int = 15,
    ) -> List[Dict]:
        """Recommend skills based on current skills and optional target career.

        Parameters
        ----------
        current_skills : list of str
            Skills the user already knows.
        target_occupation_code : str, optional
            O*NET occupation code to bias recommendations towards.
        top_k : int
            Number of recommendations to return.

        Returns
        -------
        list of dict
            Each dict has: skill, confidence, source ('autoencoder' or 'career_target'),
            and is_known (bool, always False for recommendations).
        """
        if not self._loaded:
            logger.warning("Model not loaded; returning empty recommendations")
            return []

        # Build input vector from user skills
        user_vec = self._skills_to_vector(current_skills)
        known_indices = set(np.where(user_vec > 0)[0])

        # Autoencoder reconstruction (pure numpy)
        x = user_vec.reshape(1, -1)
        reconstruction = self._forward(x).squeeze(0)

        # If a target occupation is given, boost skills from that career's profile
        career_boost = np.zeros(self.input_dim, dtype=np.float32)
        if target_occupation_code:
            occ_vec = self._get_occupation_vector(target_occupation_code)
            if occ_vec is not None:
                career_boost = occ_vec * 0.5  # 50% boost for career-relevant skills

        combined_scores = reconstruction + career_boost

        # Rank skills the user does NOT already know
        recommendations = []
        ranked_indices = np.argsort(-combined_scores)
        for idx in ranked_indices:
            idx = int(idx)
            if idx in known_indices:
                continue
            skill_name = self.index_to_skill.get(idx, f"skill_{idx}")
            # Skip generic / non-actionable skills
            if skill_name.lower() in self._SUPPRESS_SKILLS:
                continue
            # Skip O*NET commodity category names (long, vague descriptions)
            skill_lower = skill_name.lower()
            if any(p in skill_lower for p in self._SUPPRESS_PATTERNS):
                continue
            score = float(combined_scores[idx])
            if score < 0.01:  # negligible confidence
                continue
            source = "career_target" if career_boost[idx] > 0 else "autoencoder"
            recommendations.append({
                "skill": skill_name,
                "confidence": round(score, 4),
                "source": source,
                "is_known": False,
            })
            if len(recommendations) >= top_k:
                break

        return recommendations

    # ------------------------------------------------------------------
    # Batch utilities (for debugging / analysis)
    # ------------------------------------------------------------------
    def get_known_skill_matches(self, skills: List[str]) -> List[str]:
        """Return the subset of input skills that exist in the vocabulary."""
        return [
            s for s in skills
            if s.strip().lower() in self.skill_index
        ]

    def get_vocab_size(self) -> int:
        return len(self.skill_index)

    def get_latent_embedding(self, skills: List[str]) -> List[float]:
        """Get the latent-space embedding for a skill set (useful for similarity searches)."""
        if not self._loaded:
            return []
        vec = self._skills_to_vector(skills)
        x = vec.reshape(1, -1)
        z = self._encode(x).squeeze(0)
        return z.tolist()


# ---------------------------------------------------------------------------
# Module-level singleton (lazy-loaded)
# ---------------------------------------------------------------------------
_instance: Optional[SkillRecommender] = None


def get_skill_recommender() -> SkillRecommender:
    """Return (and lazily initialise) the global SkillRecommender singleton."""
    global _instance
    if _instance is None:
        _instance = SkillRecommender()
        _instance.load()
    return _instance
