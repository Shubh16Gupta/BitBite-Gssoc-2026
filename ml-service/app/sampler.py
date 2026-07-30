"""Random patch sampling.

A field photo covers many plants, so scoring the whole frame once is coarse. We
instead sample several random square patches and score each independently — this
approximates "inspect N random spots in the field" and makes the final average
more robust to a single unrepresentative region.
"""
import random
from typing import List

from PIL import Image

from .config import settings


def sample_patches(
    image: Image.Image,
    count: int = None,
    patch_fraction: float = None,
) -> List[Image.Image]:
    """Return ``count`` random square crops from ``image``.

    Patch side = ``patch_fraction`` of the shorter image dimension (clamped to a
    sensible minimum and to the image size). Patches may overlap — that's fine,
    they act as independent random samples.
    """
    count = count or settings.sample_count
    patch_fraction = patch_fraction or settings.patch_fraction

    width, height = image.size
    side = int(min(width, height) * patch_fraction)
    side = max(settings.min_patch_px, side)
    side = min(side, width, height)

    patches: List[Image.Image] = []
    for _ in range(count):
        left = 0 if width == side else random.randint(0, width - side)
        top = 0 if height == side else random.randint(0, height - side)
        patches.append(image.crop((left, top, left + side, top + side)))

    return patches
