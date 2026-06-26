import type {
  PatientFormData,
  PatientPayload,
  WizardStepId,
} from "./types";

export type FieldErrors = Partial<Record<keyof PatientFormData, string>>;

export function validateStep(
  step: WizardStepId,
  form: PatientFormData,
): FieldErrors {
  const errors: FieldErrors = {};

  if (step === "demographics") {
    if (!form.gender) errors.gender = "Select a gender option.";
    const age = Number(form.age);
    if (!form.age.trim()) errors.age = "Enter the patient's age in years.";
    else if (!Number.isInteger(age) || age < 0 || age > 120)
      errors.age = "Age must be a whole number between 0 and 120.";
    if (!form.ever_married)
      errors.ever_married = "Select a marital status option.";
    if (!form.work_type) errors.work_type = "Select a work type.";
    if (!form.Residence_type)
      errors.Residence_type = "Select a residence type.";
  }

  if (step === "clinical") {
    const glucose = Number(form.avg_glucose_level);
    if (!form.avg_glucose_level.trim())
      errors.avg_glucose_level = "Enter average glucose level in mg/dL.";
    else if (Number.isNaN(glucose) || glucose < 50 || glucose > 500)
      errors.avg_glucose_level =
        "Glucose must be between 50 and 500 mg/dL.";
  }

  if (step === "lifestyle") {
    if (form.bmi.trim()) {
      const bmi = Number(form.bmi);
      if (Number.isNaN(bmi) || bmi < 10 || bmi > 80)
        errors.bmi = "BMI must be between 10 and 80, or leave blank.";
    }
    if (!form.smoking_status)
      errors.smoking_status = "Select a smoking status.";
  }

  return errors;
}

export function toPatientPayload(form: PatientFormData): PatientPayload {
  return {
    gender: form.gender as PatientPayload["gender"],
    age: Number(form.age),
    hypertension: form.hypertension ? 1 : 0,
    heart_disease: form.heart_disease ? 1 : 0,
    ever_married: form.ever_married as PatientPayload["ever_married"],
    work_type: form.work_type as PatientPayload["work_type"],
    Residence_type: form.Residence_type as PatientPayload["Residence_type"],
    avg_glucose_level: Number(form.avg_glucose_level),
    bmi: form.bmi.trim() ? Number(form.bmi) : null,
    smoking_status: form.smoking_status as PatientPayload["smoking_status"],
  };
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
