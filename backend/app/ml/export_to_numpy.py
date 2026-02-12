"""
Export PyTorch checkpoint to NumPy arrays for torch-free inference.

Run this script ONCE (standalone, not from FastAPI) to produce a
'skill_autoencoder_numpy.npz' file that skill_recommender.py can load
without importing torch at all.

Usage:
    cd backend
    python -m app.ml.export_to_numpy
"""

import os
import sys
import numpy as np

# Ensure the backend directory is on sys.path so app.* imports work
_BACKEND_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "../.."))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

import torch
from app.ml.models.skill_autoencoder import SkillAutoencoder

_CHECKPOINT_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "models/checkpoints")
)


def export(checkpoint_path: str = None, output_path: str = None):
    ckpt_path = checkpoint_path or os.path.join(
        _CHECKPOINT_DIR, "best_skill_autoencoder.pt"
    )
    out_path = output_path or os.path.join(
        _CHECKPOINT_DIR, "skill_autoencoder_numpy.npz"
    )

    print(f"Loading checkpoint: {ckpt_path}")
    checkpoint = torch.load(ckpt_path, map_location="cpu", weights_only=False)

    input_dim = checkpoint["input_dim"]
    latent_dim = checkpoint["latent_dim"]
    dropout = checkpoint.get("dropout", 0.3)
    skill_index = checkpoint["skill_index"]
    val_loss = checkpoint.get("val_loss", None)

    # Rebuild model to populate running stats
    model = SkillAutoencoder(input_dim=input_dim, latent_dim=latent_dim, dropout=dropout)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    # ---- Extract all parameters as numpy arrays ----
    arrays = {}

    # The Sequential containers alternate:
    #   Linear → BN → LeakyReLU → Dropout   (repeated)
    #   Last encoder block ends with just Linear (no BN/activation)
    #   Last decoder block ends with Linear → Sigmoid

    def _extract_sequential(seq, prefix):
        linear_idx = 0
        bn_idx = 0
        for module in seq:
            if isinstance(module, torch.nn.Linear):
                arrays[f"{prefix}_linear{linear_idx}_weight"] = module.weight.detach().numpy()
                arrays[f"{prefix}_linear{linear_idx}_bias"] = module.bias.detach().numpy()
                linear_idx += 1
            elif isinstance(module, torch.nn.BatchNorm1d):
                arrays[f"{prefix}_bn{bn_idx}_weight"] = module.weight.detach().numpy()     # gamma
                arrays[f"{prefix}_bn{bn_idx}_bias"] = module.bias.detach().numpy()         # beta
                arrays[f"{prefix}_bn{bn_idx}_running_mean"] = module.running_mean.numpy()
                arrays[f"{prefix}_bn{bn_idx}_running_var"] = module.running_var.numpy()
                bn_idx += 1

    _extract_sequential(model.encoder, "enc")
    _extract_sequential(model.decoder, "dec")

    # Save metadata as special arrays
    import json
    skill_index_bytes = json.dumps(skill_index).encode("utf-8")
    arrays["_skill_index_json"] = np.frombuffer(skill_index_bytes, dtype=np.uint8)
    arrays["_meta"] = np.array([input_dim, latent_dim], dtype=np.int64)

    np.savez_compressed(out_path, **arrays)
    print(f"Exported {len(arrays)} arrays to: {out_path}")
    print(f"  input_dim={input_dim}, latent_dim={latent_dim}, val_loss={val_loss}")
    print(f"  File size: {os.path.getsize(out_path) / 1024:.1f} KB")


if __name__ == "__main__":
    export()
