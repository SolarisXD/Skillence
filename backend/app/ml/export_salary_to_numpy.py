"""
Export trained Salary Predictor to NumPy weights for production inference.

This avoids PyTorch DLL issues on Windows when loading models in FastAPI.

Usage (from backend/):
    python -m app.ml.export_salary_to_numpy
"""

import os
import sys
import json
import logging

import numpy as np
import torch

from app.ml.models.salary_predictor import SalaryPredictor, SalaryPredictorLite

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

_CHECKPOINT_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "models/checkpoints")
)
_DATA_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "data/processed")
)


def export_to_numpy(checkpoint_path: str, output_path: str) -> bool:
    """Export PyTorch model to NumPy weights."""
    try:
        # Load checkpoint
        logger.info(f"Loading checkpoint: {checkpoint_path}")
        checkpoint = torch.load(checkpoint_path, map_location="cpu")
        
        input_dim = checkpoint['input_dim']
        dropout_rate = checkpoint.get('dropout_rate', 0.3)
        
        # Check if it's lite model (has 'network' key in state dict)
        state_dict = checkpoint['model_state_dict']
        is_lite = any('network.' in key for key in state_dict.keys())
        
        # Create model
        if is_lite:
            model = SalaryPredictorLite(input_dim, dropout_rate)
            logger.info("Detected SalaryPredictorLite model")
        else:
            model = SalaryPredictor(input_dim, dropout_rate)
            logger.info("Detected SalaryPredictor (full) model")
        
        model.load_state_dict(state_dict)
        model.eval()
        
        logger.info(f"Model loaded: input_dim={input_dim}, dropout_rate={dropout_rate}")
        
        # Extract weights
        numpy_weights = {}
        
        for name, param in model.named_parameters():
            numpy_weights[name] = param.detach().cpu().numpy()
        
        # Also extract running stats from BatchNorm layers
        for name, module in model.named_modules():
            if isinstance(module, torch.nn.BatchNorm1d):
                numpy_weights[f"{name}.running_mean"] = module.running_mean.cpu().numpy()
                numpy_weights[f"{name}.running_var"] = module.running_var.cpu().numpy()
        
        # Add metadata
        numpy_weights["_meta"] = np.array([input_dim, dropout_rate, int(is_lite)])
        
        # Save as .npz
        np.savez_compressed(output_path, **numpy_weights)
        
        logger.info(f"✅ Exported {len(numpy_weights)} arrays to {output_path}")
        logger.info(f"   File size: {os.path.getsize(output_path) / 1024:.1f} KB")
        
        # Verify by loading
        logger.info("Verifying export...")
        loaded = np.load(output_path, allow_pickle=False)
        meta = loaded["_meta"]
        assert meta[0] == input_dim
        logger.info("✓ Export verified successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"Export failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Export the best salary predictor model."""
    
    checkpoint_path = os.path.join(_CHECKPOINT_DIR, "salary_predictor_best.pth")
    output_path = os.path.join(_CHECKPOINT_DIR, "salary_predictor_numpy.npz")
    
    if not os.path.exists(checkpoint_path):
        logger.error(f"Checkpoint not found: {checkpoint_path}")
        logger.error("Please train the model first using train_salary_model.py")
        return 1
    
    success = export_to_numpy(checkpoint_path, output_path)
    
    if success:
        print("\n✅ Export successful!")
        print(f"📁 NumPy weights: {output_path}")
        print("\nYou can now use the salary predictor in production via the inference service.")
    else:
        print("\n❌ Export failed!")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
