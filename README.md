# Stroke Classification — deployment & local dev

## VPS (stroke.zokm.me)

```bash
cp .env.example .env
docker compose up -d --build
```

- **Web:** `http://stroke.zokm.me:6454` (host `6454` → container `3003`)
- **API:** proxied at `/api` → internal `http://api:8003` (e.g. `/api/health`, `/api/predict`) via a runtime Next.js route handler

Point your reverse proxy (if any) at host port **6454**.

## Local development

```bash
# API (port 8003)
cd api && python -m uvicorn main:app --reload --port 8003

# Web (port 3003)
cd web && npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8003` in `web/.env.local` for local API access without the `/api` proxy.

## Model artifacts

The API image bundles `artifacts/models/best_model.joblib`, `artifacts/metadata.json`, and `artifacts/model_report.json`. Re-export after retraining:

```bash
python scripts/export_model_report.py
```
