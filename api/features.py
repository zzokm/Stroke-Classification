from __future__ import annotations

import numpy as np
import pandas as pd


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Feature engineering embedded in the deployed imblearn pipeline."""
    out = df.copy()
    out["cardiovascular_risk_score"] = (
        out["hypertension"].astype(int)
        + out["heart_disease"].astype(int)
        + (out["age"] >= 55).astype(int)
    )
    out["glucose_category"] = pd.cut(
        out["avg_glucose_level"],
        bins=[-np.inf, 140, 200, np.inf],
        labels=["normal", "prediabetic", "diabetic"],
    )
    out["bmi_category"] = pd.cut(
        out["bmi"],
        bins=[-np.inf, 18.5, 25, 30, np.inf],
        labels=["underweight", "normal", "overweight", "obese"],
    )
    out["is_senior"] = (out["age"] >= 65).astype(int)
    return out
