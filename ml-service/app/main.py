"""FastAPI crop-health inference service.

Endpoints
---------
GET  /health   -> liveness + which model backend is loaded.
POST /analyze  -> { imageUrls: [str], sampleCount?: int }
                  -> { cropHealthScore, model, sampleCount, images: [...] }

The FarmTrust Node backend calls POST /analyze after uploading a week's crop
images; it then blends the returned cropHealthScore with weather to form the
final AnnScore. This service is pure vision — it knows nothing about weather,
auth, or the database.
"""
from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator

from .analyzer import ImageFetchError, analyze
from .config import settings
from .models import load_model

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="FarmTrust Crop-Health Service", version="1.0.0")

# Load the model once at startup and reuse it across requests.
model = load_model()


class AnalyzeRequest(BaseModel):
    imageUrls: List[str] = Field(..., min_length=1)
    sampleCount: Optional[int] = Field(default=None, ge=1, le=50)

    @field_validator("imageUrls")
    @classmethod
    def _non_empty_urls(cls, urls: List[str]) -> List[str]:
        cleaned = [u.strip() for u in urls if u and u.strip()]
        if not cleaned:
            raise ValueError("imageUrls must contain at least one non-empty URL")
        return cleaned


@app.get("/health")
def health():
    return {"status": "ok", "model": model.name, "sampleCount": settings.sample_count}


@app.post("/analyze")
def analyze_endpoint(payload: AnalyzeRequest):
    try:
        return analyze(model, payload.imageUrls, sample_count=payload.sampleCount)
    except ImageFetchError as exc:
        # No image could be analyzed -> 422 Unprocessable Entity.
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - unexpected
        logging.getLogger("ml-service").exception("Analysis failed")
        raise HTTPException(status_code=500, detail="Inference failed.") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=False)
