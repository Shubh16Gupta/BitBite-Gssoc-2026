"""Crop-health scoring.

We do NOT classify diseases. We compute a continuous **crop-health score**
(0–100, higher = healthier/more vigorous) directly from the visible-band photo
using vegetation indices — the greener and more chlorophyll-rich the canopy, the
higher the score; yellowing, browning, wilting, or bare soil push it down.

The scorer implements a simple interface — ``score(patch) -> float`` — so it can
be swapped for a different health model later without touching the pipeline.
"""
from __future__ import annotations

import logging

import numpy as np
from PIL import Image

logger = logging.getLogger("ml-service.models")


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


class HealthModel:
    """Interface: score a single RGB patch on a 0–100 crop-health scale."""

    name = "base"

    def score(self, patch: Image.Image) -> float:  # pragma: no cover - interface
        raise NotImplementedError

    def score_batch(self, patches):
        return [self.score(p) for p in patches]


class VegetationHealthModel(HealthModel):
    """Visible-band crop-health index.

    Uses VARI (Visible Atmospherically Resistant Index):

        VARI = (G - R) / (G + R - B)

    computed on normalized channels. VARI is high for healthy green vegetation
    and low/negative for yellow, brown, or dry material. The patch score blends:

      * the mean VARI over vegetation pixels (crop vigor), and
      * the green canopy fraction (how much of the patch is living crop),

    then maps the result to 0–100.
    """

    name = "crop-health-vari"

    # VARI values mapped linearly onto [0, 1] before scaling to 0–100.
    VARI_LOW = -0.15
    VARI_HIGH = 0.65
    # Pixels with VARI above this are treated as living vegetation.
    VEG_THRESHOLD = 0.05
    # Weight of vigor vs. canopy coverage in the blended score.
    VIGOR_WEIGHT = 0.75

    def score(self, patch: Image.Image) -> float:
        arr = np.asarray(patch.convert("RGB"), dtype=np.float32)
        r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

        total = r + g + b + 1e-6
        rn, gn, bn = r / total, g / total, b / total

        denom = gn + rn - bn
        denom = np.where(np.abs(denom) < 1e-6, 1e-6, denom)
        vari = np.clip((gn - rn) / denom, -1.0, 1.0)

        veg_mask = vari > self.VEG_THRESHOLD
        green_fraction = float(np.mean(veg_mask))

        # Vigor from vegetation pixels (or the whole patch if none are green).
        mean_vari = float(vari[veg_mask].mean()) if veg_mask.any() else float(vari.mean())
        vigor = float(
            np.clip((mean_vari - self.VARI_LOW) / (self.VARI_HIGH - self.VARI_LOW), 0.0, 1.0)
        )

        health = self.VIGOR_WEIGHT * vigor + (1.0 - self.VIGOR_WEIGHT) * green_fraction
        return _clamp(health * 100.0)


def load_model() -> HealthModel:
    """Return the crop-health scorer."""
    model = VegetationHealthModel()
    logger.info("Loaded model: %s", model.name)
    return model
