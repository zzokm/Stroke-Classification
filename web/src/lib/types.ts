export type Gender = "Female" | "Male";
export type EverMarried = "Yes" | "No";
export type WorkType =
  | "Private"
  | "Self-employed"
  | "Govt_job"
  | "children"
  | "Never_worked";
export type ResidenceType = "Urban" | "Rural";
export type SmokingStatus =
  | "never smoked"
  | "formerly smoked"
  | "smokes"
  | "Unknown";
export type RiskTier = "Low" | "Medium" | "High";

export interface PatientFormData {
  gender: Gender | "";
  age: string;
  hypertension: boolean;
  heart_disease: boolean;
  ever_married: EverMarried | "";
  work_type: WorkType | "";
  Residence_type: ResidenceType | "";
  avg_glucose_level: string;
  bmi: string;
  smoking_status: SmokingStatus | "";
}

export interface PatientPayload {
  gender: Gender;
  age: number;
  hypertension: 0 | 1;
  heart_disease: 0 | 1;
  ever_married: EverMarried;
  work_type: WorkType;
  Residence_type: ResidenceType;
  avg_glucose_level: number;
  bmi: number | null;
  smoking_status: SmokingStatus;
}

export interface Thresholds {
  high_risk_min_probability: number;
  medium_risk_min_probability: number;
  low_risk_max_probability: number;
  decision_threshold: number;
}

export interface ModelMetrics {
  best_model: string;
  pr_auc: number;
  brier_score: number;
  recall: number;
  balanced_accuracy: number;
}

export interface PredictionResult {
  stroke_probability: number;
  risk_tier: RiskTier;
  recommended_action: string;
  alert_triggered: boolean;
  thresholds: Thresholds;
  model_metrics: ModelMetrics;
}

export const INITIAL_FORM: PatientFormData = {
  gender: "",
  age: "",
  hypertension: false,
  heart_disease: false,
  ever_married: "",
  work_type: "",
  Residence_type: "",
  avg_glucose_level: "",
  bmi: "",
  smoking_status: "",
};

export const WIZARD_STEPS = [
  { id: "demographics", label: "Demographics" },
  { id: "clinical", label: "Clinical history" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "review", label: "Review" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];
