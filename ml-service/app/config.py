"""Runtime configuration for the crop-health inference service.

All values are environment-overridable so the service can be tuned without code
changes. Copy `.env.example` to `.env` (loaded by `python-dotenv`) or export the
variables directly.
"""
import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # dotenv is optional
    pass


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


class Settings:
    # Server
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = _int("PORT", 8000)

    # Sampling: how many random patches per image, and patch size as a fraction
    # of the image's shorter side.
    sample_count: int = _int("SAMPLE_COUNT", 10)
    patch_fraction: float = _float("PATCH_FRACTION", 0.35)
    min_patch_px: int = _int("MIN_PATCH_PX", 48)

    # Image fetching guards.
    image_fetch_timeout: float = _float("IMAGE_FETCH_TIMEOUT", 10.0)
    max_image_bytes: int = _int("MAX_IMAGE_BYTES", 15 * 1024 * 1024)


settings = Settings()
