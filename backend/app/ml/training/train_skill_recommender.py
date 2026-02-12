"""
Training script for the Skill Recommender Autoencoder (Model 3).

Usage (from backend/ directory):
    python -m app.ml.training.train_skill_recommender

The script will:
    1.  Load pre-processed data from  app/ml/data/processed/
    2.  Train a denoising autoencoder with early stopping
    3.  Save the best model checkpoint to  app/ml/models/checkpoints/
"""

import os
import sys
import json
import time
import logging
from datetime import datetime

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset, random_split

# Add parent path so we can import sibling packages
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../.."))

from app.ml.models.skill_autoencoder import SkillAutoencoder, DenoisingWrapper

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_DATA_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "../data/processed")
)
_CHECKPOINT_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "../models/checkpoints")
)


# ---------------------------------------------------------------------------
# Hyperparameters
# ---------------------------------------------------------------------------
class Config:
    latent_dim: int = 32
    dropout: float = 0.3
    corruption_rate: float = 0.3
    learning_rate: float = 1e-3
    weight_decay: float = 1e-5
    batch_size: int = 128
    max_epochs: int = 200
    patience: int = 20          # early stopping patience
    val_split: float = 0.15     # fraction held out for validation
    seed: int = 42


# ---------------------------------------------------------------------------
# Training Loop
# ---------------------------------------------------------------------------
def train(cfg: Config = Config()):
    torch.manual_seed(cfg.seed)
    np.random.seed(cfg.seed)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Device: {device}")

    # ---- Load data -------------------------------------------------------
    vectors_path = os.path.join(_DATA_DIR, "skill_vectors.npy")
    index_path = os.path.join(_DATA_DIR, "skill_index.json")

    if not os.path.exists(vectors_path):
        logger.error(f"Processed data not found at {vectors_path}. Run skill_data_processor first.")
        return

    data = np.load(vectors_path)
    with open(index_path, "r", encoding="utf-8") as f:
        skill_index = json.load(f)

    input_dim = data.shape[1]
    logger.info(f"Loaded {data.shape[0]} samples, vocab size {input_dim}")

    # ---- Train / Val split -----------------------------------------------
    dataset = TensorDataset(torch.from_numpy(data))
    val_size = int(len(dataset) * cfg.val_split)
    train_size = len(dataset) - val_size
    train_ds, val_ds = random_split(
        dataset, [train_size, val_size],
        generator=torch.Generator().manual_seed(cfg.seed),
    )

    train_loader = DataLoader(train_ds, batch_size=cfg.batch_size, shuffle=True, drop_last=False)
    val_loader = DataLoader(val_ds, batch_size=cfg.batch_size, shuffle=False)

    logger.info(f"Train: {train_size}  |  Val: {val_size}")

    # ---- Model, criterion, optimiser ------------------------------------
    model = SkillAutoencoder(
        input_dim=input_dim,
        latent_dim=cfg.latent_dim,
        dropout=cfg.dropout,
    ).to(device)

    criterion = nn.BCELoss()
    optimiser = torch.optim.Adam(
        model.parameters(), lr=cfg.learning_rate, weight_decay=cfg.weight_decay
    )
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimiser, mode="min", factor=0.5, patience=8, min_lr=1e-6
    )

    denoiser = DenoisingWrapper(corruption_rate=cfg.corruption_rate)

    # ---- Training --------------------------------------------------------
    os.makedirs(_CHECKPOINT_DIR, exist_ok=True)
    best_val_loss = float("inf")
    patience_counter = 0
    history = {"train_loss": [], "val_loss": [], "lr": []}

    t0 = time.time()
    for epoch in range(1, cfg.max_epochs + 1):
        # --- Train ---
        model.train()
        train_loss_sum = 0.0
        for (batch,) in train_loader:
            batch = batch.to(device)
            corrupted = denoiser.corrupt(batch)
            output = model(corrupted)
            loss = criterion(output, batch)  # reconstruct original

            optimiser.zero_grad()
            loss.backward()
            optimiser.step()
            train_loss_sum += loss.item() * batch.size(0)

        train_loss = train_loss_sum / train_size

        # --- Validate ---
        model.eval()
        val_loss_sum = 0.0
        with torch.no_grad():
            for (batch,) in val_loader:
                batch = batch.to(device)
                output = model(batch)  # no corruption at validation
                loss = criterion(output, batch)
                val_loss_sum += loss.item() * batch.size(0)
        val_loss = val_loss_sum / val_size

        current_lr = optimiser.param_groups[0]["lr"]
        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["lr"].append(current_lr)

        scheduler.step(val_loss)

        # --- Early stopping & checkpoint ---
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            checkpoint = {
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimiser_state_dict": optimiser.state_dict(),
                "val_loss": val_loss,
                "input_dim": input_dim,
                "latent_dim": cfg.latent_dim,
                "dropout": cfg.dropout,
                "skill_index": skill_index,
            }
            torch.save(checkpoint, os.path.join(_CHECKPOINT_DIR, "best_skill_autoencoder.pt"))
        else:
            patience_counter += 1

        if epoch % 10 == 0 or patience_counter == 0:
            logger.info(
                f"Epoch {epoch:3d}/{cfg.max_epochs}  "
                f"train_loss={train_loss:.6f}  val_loss={val_loss:.6f}  "
                f"lr={current_lr:.2e}  patience={patience_counter}/{cfg.patience}"
            )

        if patience_counter >= cfg.patience:
            logger.info(f"Early stopping at epoch {epoch}")
            break

    elapsed = time.time() - t0
    logger.info(f"Training finished in {elapsed:.1f}s. Best val_loss: {best_val_loss:.6f}")

    # ---- Save training metadata ------------------------------------------
    meta = {
        "trained_at": datetime.utcnow().isoformat(),
        "device": str(device),
        "input_dim": input_dim,
        "latent_dim": cfg.latent_dim,
        "dropout": cfg.dropout,
        "corruption_rate": cfg.corruption_rate,
        "batch_size": cfg.batch_size,
        "final_epoch": epoch,
        "best_val_loss": best_val_loss,
        "train_samples": train_size,
        "val_samples": val_size,
        "elapsed_seconds": round(elapsed, 1),
        "history": history,
    }
    with open(os.path.join(_CHECKPOINT_DIR, "training_metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)

    logger.info(f"Checkpoint and metadata saved to {_CHECKPOINT_DIR}")


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    train()
