import type { PatientFormData, PatientPayload } from "./types";

export const PREFILL_STORAGE_KEY = "stroke-screening-prefill";
export const PREFILL_LABEL_KEY = "stroke-screening-prefill-label";

export function payloadToForm(patient: PatientPayload): PatientFormData {
  return {
    gender: patient.gender,
    age: String(Math.round(patient.age)),
    hypertension: patient.hypertension === 1,
    heart_disease: patient.heart_disease === 1,
    ever_married: patient.ever_married,
    work_type: patient.work_type,
    Residence_type: patient.Residence_type,
    avg_glucose_level: String(
      Number.isInteger(patient.avg_glucose_level)
        ? patient.avg_glucose_level
        : Number(patient.avg_glucose_level.toFixed(1)),
    ),
    bmi:
      patient.bmi == null
        ? ""
        : String(
            Number.isInteger(patient.bmi)
              ? patient.bmi
              : Number(patient.bmi.toFixed(1)),
          ),
    smoking_status: patient.smoking_status,
  };
}

export function saveScreeningPrefill(
  patient: PatientPayload,
  label?: string,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    PREFILL_STORAGE_KEY,
    JSON.stringify(payloadToForm(patient)),
  );
  if (label) {
    sessionStorage.setItem(PREFILL_LABEL_KEY, label);
  } else {
    sessionStorage.removeItem(PREFILL_LABEL_KEY);
  }
}

export function consumeScreeningPrefill(): {
  form: PatientFormData;
  label: string | null;
} | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PREFILL_STORAGE_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(PREFILL_STORAGE_KEY);
  const label = sessionStorage.getItem(PREFILL_LABEL_KEY);
  sessionStorage.removeItem(PREFILL_LABEL_KEY);

  try {
    return { form: JSON.parse(raw) as PatientFormData, label };
  } catch {
    return null;
  }
}
