from typing import Literal

from pydantic import BaseModel, Field


Gender = Literal["Female", "Male"]
EverMarried = Literal["Yes", "No"]
WorkType = Literal["Private", "Self-employed", "Govt_job", "children", "Never_worked"]
ResidenceType = Literal["Urban", "Rural"]
SmokingStatus = Literal["never smoked", "formerly smoked", "smokes", "Unknown"]
RiskTier = Literal["Low", "Medium", "High"]


class PatientInput(BaseModel):
    gender: Gender
    age: int = Field(ge=0, le=120)
    hypertension: Literal[0, 1]
    heart_disease: Literal[0, 1]
    ever_married: EverMarried
    work_type: WorkType
    Residence_type: ResidenceType
    avg_glucose_level: float = Field(ge=50, le=500)
    bmi: float | None = Field(default=None, ge=10, le=80)
    smoking_status: SmokingStatus


class ModelMetrics(BaseModel):
    best_model: str
    pr_auc: float
    brier_score: float
    recall: float
    balanced_accuracy: float


class Thresholds(BaseModel):
    high_risk_min_probability: float
    medium_risk_min_probability: float
    low_risk_max_probability: float
    decision_threshold: float


class PredictionResponse(BaseModel):
    stroke_probability: float
    risk_tier: RiskTier
    recommended_action: str
    alert_triggered: bool
    thresholds: Thresholds
    model_metrics: ModelMetrics
