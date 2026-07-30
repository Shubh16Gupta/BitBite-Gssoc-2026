"""Analysis pipeline: image URLs -> sampled patches -> per-image + overall score."""
from __future__ import annotations

import io
import logging
from typing import List, Optional

import httpx
from PIL import Image, UnidentifiedImageError

from .config import settings
from .models import HealthModel
from .sampler import sample_patches

logger = logging.getLogger("ml-service.analyzer")


class ImageFetchError(Exception):
    pass


def _round(value: Optional[float], ndigits: int = 2) -> Optional[float]:
    return round(value, ndigits) if value is not None else None


def fetch_image(url: str) -> Image.Image:
    """Download an image URL into a PIL image (with size + type guards)."""
    try:
        with httpx.Client(timeout=settings.image_fetch_timeout, follow_redirects=True) as client:
            resp = client.get(url)
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise ImageFetchError(f"Failed to fetch image: {exc}") from exc

    content = resp.content
    if len(content) > settings.max_image_bytes:
        raise ImageFetchError("Image exceeds the maximum allowed size.")

    try:
        return Image.open(io.BytesIO(content)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise ImageFetchError(f"Unsupported or corrupt image: {exc}") from exc


def average_hash(image: Image.Image, size: int = 8) -> str:
    """Perceptual average-hash (aHash) as a 16-char hex string.

    Used by the backend to detect reused/near-duplicate crop photos: two images
    are near-duplicates when their aHashes have a small Hamming distance.
    """
    import numpy as np

    small = image.convert("L").resize((size, size))
    arr = np.asarray(small, dtype=np.float32)
    mean = float(arr.mean())
    bits = (arr > mean).flatten()
    value = 0
    for b in bits:
        value = (value << 1) | int(b)
    return format(value, "016x")


def analyze_image(model: HealthModel, url: str, sample_count: int) -> dict:
    """Score one image by averaging the health of ``sample_count`` random patches."""
    image = fetch_image(url)
    patches = sample_patches(image, count=sample_count)
    patch_scores = [round(s, 2) for s in model.score_batch(patches)]
    image_score = sum(patch_scores) / len(patch_scores) if patch_scores else None

    return {
        "url": url,
        "score": _round(image_score),
        "patchScores": patch_scores,
        "sampledPatches": len(patch_scores),
        "aHash": average_hash(image),
    }


def analyze(model: HealthModel, image_urls: List[str], sample_count: int = None) -> dict:
    """Run the full pipeline over all images and average into a field score.

    Images that fail to fetch/decode are recorded with an ``error`` and excluded
    from the overall average. If every image fails, raises ImageFetchError.
    """
    sample_count = sample_count or settings.sample_count

    images: List[dict] = []
    valid_scores: List[float] = []

    for url in image_urls:
        try:
            result = analyze_image(model, url, sample_count)
            images.append(result)
            if result["score"] is not None:
                valid_scores.append(result["score"])
        except ImageFetchError as exc:
            logger.warning("Skipping image %s: %s", url, exc)
            images.append({"url": url, "score": None, "error": str(exc)})

    if not valid_scores:
        raise ImageFetchError("None of the provided images could be analyzed.")

    crop_health_score = sum(valid_scores) / len(valid_scores)

    return {
        "cropHealthScore": _round(crop_health_score),
        "model": model.name,
        "sampleCount": sample_count,
        "imageCount": len(image_urls),
        "analyzedImages": len(valid_scores),
        "images": images,
    }
