"""
Skill Recommender Autoencoder — PyTorch model definition.

Architecture
------------
Encoder:  input(V) → 256 → 128 → 64 → latent(32)
Decoder:  latent(32) → 64 → 128 → 256 → output(V)

Each hidden layer uses BatchNorm → LeakyReLU → Dropout.
The final output uses Sigmoid (since inputs are binary [0,1]).

The learned latent space captures co-occurrence patterns among skills.
Given a partial skill vector the decoder reconstructs the full vector,
ranking previously-unknown skills by reconstruction confidence.
"""

import torch
import torch.nn as nn


class SkillAutoencoder(nn.Module):
    """Denoising autoencoder for skill co-occurrence learning."""

    def __init__(self, input_dim: int, latent_dim: int = 32, dropout: float = 0.3):
        super().__init__()
        self.input_dim = input_dim
        self.latent_dim = latent_dim

        # ---------- Encoder ----------
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.BatchNorm1d(256),
            nn.LeakyReLU(0.2),
            nn.Dropout(dropout),

            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.LeakyReLU(0.2),
            nn.Dropout(dropout),

            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.LeakyReLU(0.2),
            nn.Dropout(dropout * 0.5),

            nn.Linear(64, latent_dim),
        )

        # ---------- Decoder ----------
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64),
            nn.BatchNorm1d(64),
            nn.LeakyReLU(0.2),
            nn.Dropout(dropout * 0.5),

            nn.Linear(64, 128),
            nn.BatchNorm1d(128),
            nn.LeakyReLU(0.2),
            nn.Dropout(dropout),

            nn.Linear(128, 256),
            nn.BatchNorm1d(256),
            nn.LeakyReLU(0.2),
            nn.Dropout(dropout),

            nn.Linear(256, input_dim),
            nn.Sigmoid(),
        )

        # Weight initialization
        self._init_weights()

    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    def encode(self, x: torch.Tensor) -> torch.Tensor:
        """Project input into latent space."""
        return self.encoder(x)

    def decode(self, z: torch.Tensor) -> torch.Tensor:
        """Reconstruct from latent representation."""
        return self.decoder(z)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        z = self.encode(x)
        return self.decode(z)


class DenoisingWrapper:
    """
    Applies input corruption for denoising autoencoder training.

    During training, randomly zeroes out a fraction of the input skills
    and asks the model to reconstruct the original (uncorrupted) vector.
    This forces the model to learn robust skill co-occurrence patterns
    rather than just memorising individual inputs.
    """

    def __init__(self, corruption_rate: float = 0.3):
        self.corruption_rate = corruption_rate

    def corrupt(self, x: torch.Tensor) -> torch.Tensor:
        """Zero-out random elements of the input tensor."""
        mask = torch.bernoulli(
            torch.full_like(x, 1.0 - self.corruption_rate)
        )
        return x * mask
