from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import get_cors_origins
from features import engineer_features
from schemas import ModelMetrics, PatientInput, PredictionResponse, Thresholds

# Notebook-saved pipelines unpickle __main__.engineer_features
import __main__

setattr(__main__, "engineer_features", engineer_features)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "artifacts" / "models" / "best_model.joblib"
METADATA_PATH = PROJECT_ROOT / "artifacts" / "metadata.json"
REPORT_PATH = PROJECT_ROOT / "artifacts" / "model_report.json"

ACTIONS = {
    "High": "Immediate neurology referral + glucose/BP management",
    "Medium": "Annual screening + lifestyle counseling",
    "Low": "Routine preventive care",
}

app = FastAPI(
    title="Stroke Risk Screening API",
    description="Deployable inference for the stroke classification imblearn pipeline.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def load_pipeline():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    try:
        return joblib.load(MODEL_PATH)
    except Exception as exc:
        raise RuntimeError(
            "Saved model is incompatible with the installed scikit-learn version. "
            "Use scikit-learn 1.6.x (see api/requirements.txt) or re-export the model."
        ) from exc


@lru_cache(maxsize=1)
def load_metadata() -> dict:
    if not METADATA_PATH.exists():
        raise FileNotFoundError(f"Metadata not found at {METADATA_PATH}")
    return json.loads(METADATA_PATH.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def load_model_report() -> dict:
    if not REPORT_PATH.exists():
        raise FileNotFoundError(
            f"Model report not found at {REPORT_PATH}. "
            "Run: python scripts/export_model_report.py"
        )
    return json.loads(REPORT_PATH.read_text(encoding="utf-8"))


def classify_risk(probability: float, thresholds: dict) -> str:
    high = thresholds.get("decision_threshold", thresholds["high_risk_min_probability"])
    medium = thresholds["medium_risk_min_probability"]
    if probability >= high:
        return "High"
    if probability >= medium:
        return "Medium"
    return "Low"


@app.get("/model/report")
def model_report():
    try:
        report = load_model_report()
        meta = load_metadata()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return {
        **report,
        "metadata": {
            "best_model": meta.get("best_model"),
            "created_at": meta.get("created_at"),
            "random_state": meta.get("random_state"),
            "raw_input_features": meta.get("raw_input_features", []),
        },
    }


@app.get("/health")
def health():
    try:
        load_pipeline()
        meta = load_metadata()
        return {"status": "ok", "model": meta.get("best_model", "unknown")}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/predict", response_model=PredictionResponse)
def predict(patient: PatientInput):
    try:
        pipeline = load_pipeline()
        meta = load_metadata()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    payload = patient.model_dump()
    if payload["bmi"] is None:
        payload["bmi"] = float("nan")

    row = pd.DataFrame([payload])
    try:
        probability = float(pipeline.predict_proba(row)[0, 1])
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Prediction failed: {exc}") from exc

    thresholds_raw = meta["risk_thresholds"]
    tier = classify_risk(probability, thresholds_raw)
    high = thresholds_raw.get("decision_threshold", thresholds_raw["high_risk_min_probability"])

    metrics = meta.get("best_model_metrics", {})
    return PredictionResponse(
        stroke_probability=probability,
        risk_tier=tier,
        recommended_action=ACTIONS[tier],
        alert_triggered=probability >= high,
        thresholds=Thresholds(
            high_risk_min_probability=thresholds_raw["high_risk_min_probability"],
            medium_risk_min_probability=thresholds_raw["medium_risk_min_probability"],
            low_risk_max_probability=thresholds_raw["low_risk_max_probability"],
            decision_threshold=high,
        ),
        model_metrics=ModelMetrics(
            best_model=meta.get("best_model", "unknown"),
            pr_auc=float(metrics.get("pr_auc", 0)),
            brier_score=float(metrics.get("brier_score", 0)),
            recall=float(metrics.get("recall", 0)),
            balanced_accuracy=float(metrics.get("balanced_accuracy", 0)),
        ),
    )
