#!/usr/bin/env python3
"""Export artifacts/model_report.json for the model details UI."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import calibration_curve
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    precision_recall_curve,
)
from sklearn.model_selection import train_test_split

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "api"))

import __main__  # noqa: E402
from features import engineer_features  # noqa: E402

setattr(__main__, "engineer_features", engineer_features)

DATA_PATH = PROJECT_ROOT / "Dataset" / "healthcare-dataset-stroke-data.csv"
MODEL_PATH = PROJECT_ROOT / "artifacts" / "models" / "best_model.joblib"
METADATA_PATH = PROJECT_ROOT / "artifacts" / "metadata.json"
REPORT_PATH = PROJECT_ROOT / "artifacts" / "model_report.json"
RANDOM_STATE = 42


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["bmi"] = pd.to_numeric(out["bmi"], errors="coerce")
    out = out[out["gender"] != "Other"]
    out = out.drop(columns=["id"])
    return out.reset_index(drop=True)


def classify_risk(probability: float, thresholds: dict) -> str:
    high = thresholds.get("decision_threshold", thresholds["high_risk_min_probability"])
    medium = thresholds["medium_risk_min_probability"]
    if probability >= high:
        return "High"
    if probability >= medium:
        return "Medium"
    return "Low"


def curve_points(recall: np.ndarray, precision: np.ndarray) -> list[dict]:
    return [
        {"recall": float(r), "precision": float(p)}
        for r, p in zip(recall, precision)
        if not (np.isnan(r) or np.isnan(p))
    ]


def main() -> None:
    meta = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    pipeline = joblib.load(MODEL_PATH)

    df_raw = pd.read_csv(DATA_PATH)
    df = clean_data(df_raw)
    stroke_counts = df["stroke"].value_counts().to_dict()

    X = df.drop(columns=["stroke"])
    y = df["stroke"]
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )

    y_proba = pipeline.predict_proba(X_test)[:, 1]
    threshold = meta["risk_thresholds"]["decision_threshold"]
    y_pred = (y_proba >= threshold).astype(int)

    prec, rec, _ = precision_recall_curve(y_test, y_proba)
    pr_auc = float(average_precision_score(y_test, y_proba))
    frac_pos, mean_pred = calibration_curve(y_test, y_proba, n_bins=10, strategy="uniform")
    cm = confusion_matrix(y_test, y_pred)

    importances = None
    try:
        classifier = pipeline.named_steps["classifier"]
        preprocessor = pipeline.named_steps["preprocessor"]
        if hasattr(classifier, "feature_importances_") and hasattr(
            preprocessor, "get_feature_names_out"
        ):
            names = list(preprocessor.get_feature_names_out())
            imp = classifier.feature_importances_
            pairs = sorted(zip(names, imp), key=lambda x: x[1], reverse=True)[:15]
            importances = [{"feature": n, "importance": float(v)} for n, v in pairs]
    except Exception:
        importances = [
            {"feature": name, "importance": 0.0}
            for name in meta.get("feature_names", [])[:15]
        ]

    models_comparison = []
    for key, metrics in meta.get("metrics", {}).items():
        models_comparison.append(
            {
                "name": key,
                "label": key.replace("_", " ").title(),
                "is_best": key == meta.get("best_model"),
                "accuracy": metrics.get("accuracy"),
                "balanced_accuracy": metrics.get("balanced_accuracy"),
                "precision": metrics.get("precision"),
                "recall": metrics.get("recall"),
                "f1": metrics.get("f1"),
                "pr_auc": metrics.get("pr_auc"),
                "roc_auc": metrics.get("roc_auc"),
                "brier_score": metrics.get("brier_score"),
            }
        )

    pr_curves = []
    best_name = meta.get("best_model", "random_forest")
    pr_curves.append(
        {
            "model": best_name,
            "label": best_name.replace("_", " ").title(),
            "pr_auc": pr_auc,
            "points": curve_points(rec, prec),
        }
    )
    for key, metrics in meta.get("metrics", {}).items():
        if key == best_name:
            continue
        auc = float(metrics.get("pr_auc", 0))
        pr_curves.append(
            {
                "model": key,
                "label": key.replace("_", " ").title(),
                "pr_auc": auc,
                "points": [
                    {"recall": 0.0, "precision": 1.0},
                    {"recall": 0.5, "precision": max(auc, 0.01)},
                    {"recall": 1.0, "precision": auc},
                ],
                "approximate": True,
            }
        )

    presets = [
        {
            "id": "high_risk_senior",
            "label": "High-risk senior",
            "description": "Older male with hypertension, heart disease, elevated glucose and BMI.",
            "patient": {
                "gender": "Male",
                "age": 67,
                "hypertension": 1,
                "heart_disease": 0,
                "ever_married": "Yes",
                "work_type": "Private",
                "Residence_type": "Urban",
                "avg_glucose_level": 228.69,
                "bmi": 36.6,
                "smoking_status": "formerly smoked",
            },
        },
        {
            "id": "moderate_middle_aged",
            "label": "Moderate middle-aged",
            "description": "Middle-aged female with hypertension and borderline glucose.",
            "patient": {
                "gender": "Female",
                "age": 54,
                "hypertension": 1,
                "heart_disease": 0,
                "ever_married": "Yes",
                "work_type": "Private",
                "Residence_type": "Urban",
                "avg_glucose_level": 140.0,
                "bmi": 28.4,
                "smoking_status": "never smoked",
            },
        },
        {
            "id": "low_risk_younger",
            "label": "Low-risk younger adult",
            "description": "Younger adult without comorbidities and normal vitals.",
            "patient": {
                "gender": "Female",
                "age": 32,
                "hypertension": 0,
                "heart_disease": 0,
                "ever_married": "No",
                "work_type": "Private",
                "Residence_type": "Urban",
                "avg_glucose_level": 92.0,
                "bmi": 22.1,
                "smoking_status": "never smoked",
            },
        },
    ]

    sample_row = X_test.iloc[0].to_dict()
    presets.append(
        {
            "id": "holdout_sample",
            "label": "Hold-out test sample",
            "description": "First row from the stratified test split (seed 42).",
            "patient": {
                k: (None if (isinstance(v, float) and np.isnan(v)) else v)
                for k, v in sample_row.items()
            },
        }
    )

    cd = meta.get("class_distribution", {})
    report = {
        "dataset": {
            "source": "healthcare-dataset-stroke-data.csv",
            "rows_raw": int(len(df_raw)),
            "rows_clean": int(len(df)),
            "columns": int(len(df.columns) + 1),
            "stroke_positive": int(stroke_counts.get(1, 0)),
            "stroke_negative": int(stroke_counts.get(0, 0)),
            "prevalence_pct": round(100 * stroke_counts.get(1, 0) / len(df), 2),
            "train_total": cd.get("train_total"),
            "train_stroke": cd.get("train_stroke"),
            "test_total": cd.get("test_total"),
            "test_stroke": cd.get("test_stroke"),
            "raw_input_features": meta.get("raw_input_features", []),
        },
        "pipeline": {
            "steps": [
                "Feature engineering (cardiovascular risk score, glucose/BMI categories, senior flag)",
                "KNN imputation on numeric fields",
                "One-hot encoding + standard scaling",
                "SMOTE resampling (Random Forest training only)",
                "Random Forest classifier",
            ],
            "imputation_method": meta.get("imputation_method"),
            "resampling_method": meta.get("resampling_method"),
            "hyperparameters": meta.get("hyperparameters", {}),
            "generalization_gaps": meta.get("generalization_gaps", {}),
            "best_model": meta.get("best_model"),
        },
        "models_comparison": models_comparison,
        "charts": {
            "class_balance": [
                {"label": "No stroke", "count": int(stroke_counts.get(0, 0))},
                {"label": "Stroke", "count": int(stroke_counts.get(1, 0))},
            ],
            "pr_curves": pr_curves,
            "calibration": [
                {
                    "model": best_name,
                    "points": [
                        {"mean_predicted": float(m), "fraction_positive": float(f)}
                        for m, f in zip(mean_pred, frac_pos)
                    ],
                }
            ],
            "confusion_matrix": {
                "labels": ["No stroke", "Stroke"],
                "matrix": cm.tolist(),
            },
            "feature_importance": importances or [],
        },
        "deployment": {
            "risk_thresholds": meta.get("risk_thresholds", {}),
            "actions": {
                "High": "Immediate neurology referral + glucose/BP management",
                "Medium": "Annual screening + lifestyle counseling",
                "Low": "Routine preventive care",
            },
            "best_model_metrics": meta.get("best_model_metrics", {}),
            "created_at": meta.get("created_at"),
            "random_state": meta.get("random_state"),
        },
        "presets": presets,
    }

    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Wrote {REPORT_PATH}")


if __name__ == "__main__":
    main()
