import type { PatientPayload } from "./types";

export interface ModelComparisonRow {
  name: string;
  label: string;
  is_best: boolean;
  accuracy: number;
  balanced_accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  pr_auc: number;
  roc_auc: number;
  brier_score: number;
}

export interface ModelReport {
  dataset: {
    source: string;
    rows_raw: number;
    rows_clean: number;
    columns: number;
    stroke_positive: number;
    stroke_negative: number;
    prevalence_pct: number;
    train_total: number;
    train_stroke: number;
    test_total: number;
    test_stroke: number;
    raw_input_features: string[];
  };
  pipeline: {
    steps: string[];
    imputation_method: string;
    resampling_method: string;
    hyperparameters: Record<string, string | number>;
    generalization_gaps: {
      train_bal_acc: Record<string, number>;
      cv_bal_acc: Record<string, number>;
      gap: Record<string, number>;
    };
    best_model: string;
  };
  models_comparison: ModelComparisonRow[];
  charts: {
    class_balance: { label: string; count: number }[];
    pr_curves: {
      model: string;
      label: string;
      pr_auc: number;
      points: { recall: number; precision: number }[];
      approximate?: boolean;
    }[];
    calibration: {
      model: string;
      points: { mean_predicted: number; fraction_positive: number }[];
    }[];
    confusion_matrix: {
      labels: string[];
      matrix: number[][];
    };
    feature_importance: { feature: string; importance: number }[];
  };
  deployment: {
    risk_thresholds: {
      decision_threshold: number;
      high_risk_min_probability: number;
      medium_risk_min_probability: number;
      low_risk_max_probability: number;
    };
    actions: Record<string, string>;
    best_model_metrics: Record<string, number>;
    created_at: string;
    random_state: number;
  };
  presets: PatientPreset[];
  metadata?: {
    best_model: string;
    created_at: string;
    random_state: number;
    raw_input_features: string[];
  };
}

export interface PatientPreset {
  id: string;
  label: string;
  description: string;
  patient: PatientPayload;
}

export const MODEL_SECTIONS = [
  { id: "overview", label: "At a glance" },
  { id: "dataset", label: "Dataset & class balance" },
  { id: "pipeline", label: "Pipeline & preprocessing" },
  { id: "model-selection", label: "Model comparison" },
  { id: "evaluation", label: "Evaluation charts" },
  { id: "features", label: "Feature importance" },
  { id: "deployment", label: "Deployment & risk tiers" },
  { id: "sample-patients", label: "Sample patients" },
] as const;

export type ModelSectionId = (typeof MODEL_SECTIONS)[number]["id"];

export function formatFeatureName(raw: string): string {
  return raw
    .replace(/^num__/, "")
    .replace(/^cat__/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
