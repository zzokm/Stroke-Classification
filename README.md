# Stroke Risk Classification

Machine learning pipeline and deployment for stroke risk screening from routine health records. A Jupyter notebook trains and evaluates classifiers; a **Next.js** web app and **FastAPI** API serve predictions in production.

**Live demo:** [stroke.zokm.me:6454](http://stroke.zokm.me:6454)

## Repository layout

| Path | Purpose |
|------|---------|
| `stroke_classification.ipynb` | Full ML workflow: cleaning, EDA, feature engineering, modeling, evaluation, artifact export |
| `api/` | FastAPI inference service (`/health`, `/predict`, `/model-report`) |
| `web/` | Next.js screening wizard + model details UI |
| `artifacts/` | Deployed model (`best_model.joblib`), `metadata.json`, `model_report.json` |
| `scripts/` | `export_model_report.py`, `health_check.py` |
| `Dataset/` | Raw CSV (local only — not committed; see below) |
| `visuals/` | Notebook plots (local only — regenerated when you run the notebook) |

## Dataset

Place the Kaggle healthcare stroke dataset at:

```text
Dataset/healthcare-dataset-stroke-data.csv
```

The notebook and training scripts expect this path. The dataset is gitignored because of size and licensing; download it separately before training.

## Training (notebook)

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
python -m ipykernel install --user --name stroke-classification

jupyter notebook stroke_classification.ipynb
```

The notebook:

1. Cleans and explores the stroke dataset (~5% positive class)
2. Engineers features (cardiovascular risk score, glucose/BMI categories, senior flag)
3. Trains Logistic Regression, Random Forest, and XGBoost via an **imblearn** pipeline (KNN imputation, SMOTE for RF, class weights for LR/XGB)
4. Saves `artifacts/models/best_model.joblib` and `artifacts/metadata.json`

After retraining, refresh the model report used by the web UI:

```bash
python scripts/export_model_report.py
```

## Local development (app)

From the repo root:

```bash
npm run install:all
npm run dev
```

Or run services separately:

```bash
# API — port 8003
cd api && python -m uvicorn main:app --reload --port 8003

# Web — port 3003
cd web && npm run dev
```

For local dev without Docker, set `NEXT_PUBLIC_API_URL=http://localhost:8003` in `web/.env.local`.

- **Web:** http://localhost:3003  
- **API:** http://localhost:8003/health  

## Docker deployment

```bash
cp .env.example .env
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Web | `http://<host>:6454` (maps host `6454` → container `3003`) |
| API | Proxied at `/api` (e.g. `/api/health`, `/api/predict`) via Next.js runtime route |

The API image bundles `artifacts/models/best_model.joblib`, `metadata.json`, and `model_report.json`. Rebuild images after updating artifacts.

Optional env (see `.env.example`):

- `CORS_ORIGINS` — allowed API origins for production

## Model artifacts

Committed artifacts reflect the notebook’s best hold-out model (**Random Forest**). Key files:

- `artifacts/models/best_model.joblib` — full sklearn/imblearn pipeline
- `artifacts/metadata.json` — thresholds, metrics, feature names
- `artifacts/model_report.json` — charts and copy for the model details page

`scikit-learn` is pinned to `>=1.6.1,<1.7` in `api/requirements.txt` and `requirements.txt` to match the serialized pipeline.

## Tech stack

- **ML:** pandas, scikit-learn, imbalanced-learn, XGBoost, Plotly
- **API:** FastAPI, Pydantic, joblib
- **Web:** Next.js 16, React, Tailwind CSS, shadcn/ui

## License

Academic / portfolio use. Verify dataset license before redistributing data.
