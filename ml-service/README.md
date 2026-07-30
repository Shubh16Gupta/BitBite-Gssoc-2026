# FarmTrust Crop-Health Service

A small FastAPI microservice that produces a **crop-health score** from field
photos. It does **not** detect diseases — it measures crop vigor/greenness. The
Node backend calls it after a weekly upload; it downloads each image, samples
random patches, scores each patch, and returns an averaged crop-health score.
The backend then blends that score with weather to produce the final AnnScore.

## How it works

```
Node backend  ──POST /analyze { imageUrls, sampleCount }──▶  this service
                                                              │
                          for each image URL:                 │
                            • download (Cloudinary)           │
                            • sample 10 random patches        │
                            • score each patch 0–100          │
                            • average → per-image score       │
                          average per-image → cropHealthScore │
              ◀──────────── { cropHealthScore, images[...] } ─┘
```

## The score

Health is computed directly from the visible-band photo using **VARI**
(Visible Atmospherically Resistant Index), `VARI = (G - R) / (G + R - B)`:

* healthy, green, chlorophyll-rich canopy → **high** score
* yellowing / browning / wilting / bare soil → **low** score

Each patch score blends crop vigor (mean VARI over vegetation) with green canopy
coverage. No model download or GPU needed — just Pillow + NumPy. To use a
different health model later, implement `score(patch) -> float` in
`app/models.py`; the pipeline is unchanged.

## Run

```bash
cd ml-service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Point the backend at it by setting `AI_SERVICE_URL=http://localhost:8000` in
`backend/.env`.

## API

`GET /health` → `{ "status": "ok", "model": "crop-health-vari", "sampleCount": 10 }`

`POST /analyze`
```json
{ "imageUrls": ["https://res.cloudinary.com/.../w1.jpg"], "sampleCount": 10 }
```
→
```json
{
  "cropHealthScore": 84.2,
  "model": "crop-health-vari",
  "sampleCount": 10,
  "imageCount": 3,
  "analyzedImages": 3,
  "images": [
    { "url": "...", "score": 85.1, "patchScores": [86.0, 83.2, ...], "sampledPatches": 10 }
  ]
}
```
