"""
Salary Predictor Model - Deep Learning MLP for Salary Prediction.

Architecture:
    Input(F) → 512 → 256 → 128 → 64 → 1 (salary output)
    
Each hidden layer uses:
- BatchNorm → ReLU → Dropout
- Skip connections for better gradient flow

Training:
- Loss: MSE (Mean Squared Error) for regression
- Optimizer: Adam with weight decay
- Scheduler: ReduceLROnPlateau
- Early stopping based on validation loss
"""

import torch
import torch.nn as nn


class SalaryPredictor(nn.Module):
    """Deep neural network for salary prediction."""
    
    def __init__(self, input_dim: int, dropout_rate: float = 0.3):
        super().__init__()
        
        self.input_dim = input_dim
        self.dropout_rate = dropout_rate
        
        # Encoder layers
        self.fc1 = nn.Linear(input_dim, 512)
        self.bn1 = nn.BatchNorm1d(512)
        self.dropout1 = nn.Dropout(dropout_rate)
        
        self.fc2 = nn.Linear(512, 256)
        self.bn2 = nn.BatchNorm1d(256)
        self.dropout2 = nn.Dropout(dropout_rate)
        
        self.fc3 = nn.Linear(256, 128)
        self.bn3 = nn.BatchNorm1d(128)
        self.dropout3 = nn.Dropout(dropout_rate * 0.8)
        
        self.fc4 = nn.Linear(128, 64)
        self.bn4 = nn.BatchNorm1d(64)
        self.dropout4 = nn.Dropout(dropout_rate * 0.6)
        
        # Output layer
        self.fc_out = nn.Linear(64, 1)
        
        # Skip connections
        self.skip1 = nn.Linear(input_dim, 256)
        self.skip2 = nn.Linear(256, 64)
        
        # Activation
        self.relu = nn.ReLU()
        
        # Initialize weights
        self._init_weights()
    
    def _init_weights(self):
        """Initialize weights using He initialization."""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.BatchNorm1d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.
        
        Args:
            x: Input tensor of shape (batch_size, input_dim)
            
        Returns:
            Predicted salary (normalized) of shape (batch_size, 1)
        """
        identity = x
        
        # Layer 1
        out = self.fc1(x)
        out = self.bn1(out)
        out = self.relu(out)
        out = self.dropout1(out)
        
        # Layer 2 with skip connection
        out = self.fc2(out)
        out = self.bn2(out)
        skip = self.skip1(identity)
        out = out + skip  # Skip connection
        out = self.relu(out)
        out = self.dropout2(out)
        
        identity2 = out
        
        # Layer 3
        out = self.fc3(out)
        out = self.bn3(out)
        out = self.relu(out)
        out = self.dropout3(out)
        
        # Layer 4 with skip connection
        out = self.fc4(out)
        out = self.bn4(out)
        skip2 = self.skip2(identity2)
        out = out + skip2  # Skip connection
        out = self.relu(out)
        out = self.dropout4(out)
        
        # Output
        out = self.fc_out(out)
        
        return out
    
    def predict(self, x: torch.Tensor) -> torch.Tensor:
        """Predict in eval mode (no dropout)."""
        self.eval()
        with torch.no_grad():
            return self.forward(x)


class SalaryPredictorLite(nn.Module):
    """Lighter version of salary predictor for faster inference."""
    
    def __init__(self, input_dim: int, dropout_rate: float = 0.25):
        super().__init__()
        
        self.input_dim = input_dim
        self.dropout_rate = dropout_rate
        
        self.network = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout_rate * 0.8),
            
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(dropout_rate * 0.6),
            
            nn.Linear(64, 1)
        )
        
        self._init_weights()
    
    def _init_weights(self):
        """Initialize weights."""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.BatchNorm1d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)
    
    def predict(self, x: torch.Tensor) -> torch.Tensor:
        """Predict in eval mode."""
        self.eval()
        with torch.no_grad():
            return self.forward(x)
