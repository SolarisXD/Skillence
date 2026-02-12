"""
Training script for Salary Predictor Model.

Usage (from backend/):
    python -m app.ml.training.train_salary_model
    
    Optional arguments:
        --epochs 200
        --batch-size 128
        --lr 0.001
        --model lite  # Use lighter model
"""

import os
import sys
import json
import time
import argparse
import logging
from typing import Dict, Any

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from torch.optim import Adam
from torch.optim.lr_scheduler import ReduceLROnPlateau

from app.ml.models.salary_predictor import SalaryPredictor, SalaryPredictorLite

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Paths
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_DATA_DIR = os.path.normpath(os.path.join(_BASE_DIR, "../data/processed"))
_CHECKPOINT_DIR = os.path.normpath(os.path.join(_BASE_DIR, "../models/checkpoints"))

os.makedirs(_CHECKPOINT_DIR, exist_ok=True)


class SalaryModelTrainer:
    """Trainer for salary prediction model."""
    
    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        val_loader: DataLoader,
        test_loader: DataLoader,
        lr: float = 1e-3,
        weight_decay: float = 1e-5,
        device: str = "cpu"
    ):
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.test_loader = test_loader
        self.device = device
        
        self.criterion = nn.MSELoss()
        self.optimizer = Adam(
            model.parameters(),
            lr=lr,
            weight_decay=weight_decay
        )
        self.scheduler = ReduceLROnPlateau(
            self.optimizer,
            mode='min',
            factor=0.5,
            patience=10,
            verbose=True
        )
        
        self.best_val_loss = float('inf')
        self.patience_counter = 0
        self.history = {
            'train_loss': [],
            'val_loss': [],
            'test_loss': None,
            'learning_rates': []
        }
    
    def train_epoch(self) -> float:
        """Train for one epoch."""
        self.model.train()
        total_loss = 0.0
        num_batches = 0
        
        for X_batch, y_batch in self.train_loader:
            X_batch = X_batch.to(self.device)
            y_batch = y_batch.to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            predictions = self.model(X_batch).squeeze()
            loss = self.criterion(predictions, y_batch)
            
            # Backward pass
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            
            self.optimizer.step()
            
            total_loss += loss.item()
            num_batches += 1
        
        return total_loss / num_batches
    
    def validate(self) -> float:
        """Validate the model."""
        self.model.eval()
        total_loss = 0.0
        num_batches = 0
        
        with torch.no_grad():
            for X_batch, y_batch in self.val_loader:
                X_batch = X_batch.to(self.device)
                y_batch = y_batch.to(self.device)
                
                predictions = self.model(X_batch).squeeze()
                loss = self.criterion(predictions, y_batch)
                
                total_loss += loss.item()
                num_batches += 1
        
        return total_loss / num_batches
    
    def test(self) -> Dict[str, float]:
        """Test the model and compute metrics."""
        self.model.eval()
        all_predictions = []
        all_targets = []
        
        with torch.no_grad():
            for X_batch, y_batch in self.test_loader:
                X_batch = X_batch.to(self.device)
                y_batch = y_batch.to(self.device)
                
                predictions = self.model(X_batch).squeeze()
                
                all_predictions.append(predictions.cpu().numpy())
                all_targets.append(y_batch.cpu().numpy())
        
        predictions = np.concatenate(all_predictions)
        targets = np.concatenate(all_targets)
        
        # Compute metrics
        mse = np.mean((predictions - targets) ** 2)
        rmse = np.sqrt(mse)
        mae = np.mean(np.abs(predictions - targets))
        
        # R² score
        ss_res = np.sum((targets - predictions) ** 2)
        ss_tot = np.sum((targets - np.mean(targets)) ** 2)
        r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        return {
            'mse': float(mse),
            'rmse': float(rmse),
            'mae': float(mae),
            'r2': float(r2)
        }
    
    def train(self, num_epochs: int = 200, patience: int = 25) -> Dict[str, Any]:
        """Train the model with early stopping."""
        logger.info(f"Starting training for {num_epochs} epochs...")
        logger.info(f"Device: {self.device}")
        logger.info(f"Model parameters: {sum(p.numel() for p in self.model.parameters()):,}")
        
        start_time = time.time()
        
        for epoch in range(1, num_epochs + 1):
            # Train
            train_loss = self.train_epoch()
            
            # Validate
            val_loss = self.validate()
            
            # Update scheduler
            self.scheduler.step(val_loss)
            
            # Record history
            self.history['train_loss'].append(train_loss)
            self.history['val_loss'].append(val_loss)
            self.history['learning_rates'].append(
                self.optimizer.param_groups[0]['lr']
            )
            
            # Log progress
            if epoch % 10 == 0 or epoch == 1:
                logger.info(
                    f"Epoch {epoch:3d}/{num_epochs} | "
                    f"Train Loss: {train_loss:.6f} | "
                    f"Val Loss: {val_loss:.6f} | "
                    f"LR: {self.optimizer.param_groups[0]['lr']:.6f}"
                )
            
            # Check for improvement
            if val_loss < self.best_val_loss:
                self.best_val_loss = val_loss
                self.patience_counter = 0
                
                # Save best model
                self._save_checkpoint(epoch, val_loss, is_best=True)
                
            else:
                self.patience_counter += 1
                
                # Early stopping
                if self.patience_counter >= patience:
                    logger.info(f"Early stopping triggered at epoch {epoch}")
                    break
        
        # Test the best model
        logger.info("\nTesting best model...")
        test_metrics = self.test()
        self.history['test_loss'] = test_metrics['mse']
        
        elapsed_time = time.time() - start_time
        
        logger.info(f"\n{'='*60}")
        logger.info("Training Complete!")
        logger.info(f"{'='*60}")
        logger.info(f"Best validation loss: {self.best_val_loss:.6f}")
        logger.info(f"Test MSE:  {test_metrics['mse']:.6f}")
        logger.info(f"Test RMSE: {test_metrics['rmse']:.6f}")
        logger.info(f"Test MAE:  {test_metrics['mae']:.6f}")
        logger.info(f"Test R²:   {test_metrics['r2']:.4f}")
        logger.info(f"Training time: {elapsed_time:.1f}s ({elapsed_time/60:.1f} min)")
        logger.info(f"{'='*60}\n")
        
        return {
            'best_val_loss': self.best_val_loss,
            'test_metrics': test_metrics,
            'history': self.history,
            'final_epoch': epoch,
            'training_time': elapsed_time
        }
    
    def _save_checkpoint(self, epoch: int, val_loss: float, is_best: bool = False):
        """Save model checkpoint."""
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'val_loss': val_loss,
            'input_dim': self.model.input_dim,
            'dropout_rate': self.model.dropout_rate
        }
        
        if is_best:
            path = os.path.join(_CHECKPOINT_DIR, "salary_predictor_best.pth")
            torch.save(checkpoint, path)
            logger.info(f"✓ Saved best model (val_loss: {val_loss:.6f})")


def load_data(batch_size: int = 128) -> tuple:
    """Load preprocessed data and create data loaders."""
    logger.info("Loading preprocessed data...")
    
    # Load data
    X_train = np.load(os.path.join(_DATA_DIR, "salary_train_X.npy"))
    y_train = np.load(os.path.join(_DATA_DIR, "salary_train_y.npy"))
    X_val = np.load(os.path.join(_DATA_DIR, "salary_val_X.npy"))
    y_val = np.load(os.path.join(_DATA_DIR, "salary_val_y.npy"))
    X_test = np.load(os.path.join(_DATA_DIR, "salary_test_X.npy"))
    y_test = np.load(os.path.join(_DATA_DIR, "salary_test_y.npy"))
    
    logger.info(f"Train: {X_train.shape}, Val: {X_val.shape}, Test: {X_test.shape}")
    
    # Convert to PyTorch tensors
    train_dataset = TensorDataset(
        torch.FloatTensor(X_train),
        torch.FloatTensor(y_train)
    )
    val_dataset = TensorDataset(
        torch.FloatTensor(X_val),
        torch.FloatTensor(y_val)
    )
    test_dataset = TensorDataset(
        torch.FloatTensor(X_test),
        torch.FloatTensor(y_test)
    )
    
    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, val_loader, test_loader, X_train.shape[1]


def main():
    """Main training function."""
    parser = argparse.ArgumentParser(description="Train Salary Predictor")
    parser.add_argument("--epochs", type=int, default=200, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=128, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    parser.add_argument("--model", type=str, default="full", choices=["full", "lite"])
    parser.add_argument("--patience", type=int, default=25, help="Early stopping patience")
    
    args = parser.parse_args()
    
    # Load data
    train_loader, val_loader, test_loader, input_dim = load_data(args.batch_size)
    
    # Create model
    if args.model == "lite":
        model = SalaryPredictorLite(input_dim)
        logger.info("Using SalaryPredictorLite")
    else:
        model = SalaryPredictor(input_dim)
        logger.info("Using SalaryPredictor (full)")
    
    # Create trainer
    trainer = SalaryModelTrainer(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        test_loader=test_loader,
        lr=args.lr
    )
    
    # Train
    results = trainer.train(num_epochs=args.epochs, patience=args.patience)
    
    # Save training results
    results_path = os.path.join(_CHECKPOINT_DIR, "salary_training_results.json")
    
    # Convert history arrays to lists for JSON serialization
    results['history']['train_loss'] = [float(x) for x in results['history']['train_loss']]
    results['history']['val_loss'] = [float(x) for x in results['history']['val_loss']]
    results['history']['learning_rates'] = [float(x) for x in results['history']['learning_rates']]
    
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Training results saved to {results_path}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
