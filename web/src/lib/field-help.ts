export interface FieldHelp {
  label: string;
  description: string;
  validRange?: string;
}

export const FIELD_HELP = {
  gender: {
    label: "gender",
    description:
      "Sex recorded in the patient's health record. The model uses this as a demographic risk factor.",
    validRange: "Female or Male",
  },
  age: {
    label: "age",
    description:
      "Patient age in complete years at the time of screening.",
    validRange: "Whole number from 0 to 120",
  },
  ever_married: {
    label: "marital status",
    description:
      "Whether the patient has ever been married, as recorded in the dataset used to train the model.",
    validRange: "Yes or No",
  },
  work_type: {
    label: "work type",
    description:
      "Primary employment category. Select the option that best matches the patient's current or most recent status.",
    validRange:
      "Private, Self-employed, Government job, Children, or Never worked",
  },
  Residence_type: {
    label: "residence type",
    description:
      "Whether the patient lives in an urban or rural area.",
    validRange: "Urban or Rural",
  },
  hypertension: {
    label: "hypertension",
    description:
      "Whether the patient has been diagnosed with high blood pressure (hypertension).",
    validRange: "Toggle on for Yes, off for No",
  },
  heart_disease: {
    label: "heart disease",
    description:
      "Whether the patient has been diagnosed with heart disease, including coronary or other cardiac conditions.",
    validRange: "Toggle on for Yes, off for No",
  },
  avg_glucose_level: {
    label: "average glucose level",
    description:
      "Average blood glucose from recent lab results, in milligrams per deciliter (mg/dL).",
    validRange: "50 to 500 mg/dL (decimals allowed)",
  },
  bmi: {
    label: "BMI",
    description:
      "Body mass index (kg/m²). Leave blank if unknown — the model will impute a value from similar patients.",
    validRange: "10 to 80, or leave blank",
  },
  smoking_status: {
    label: "smoking status",
    description:
      "Lifetime smoking history. Choose the option closest to the patient's current status.",
    validRange:
      "Never smoked, Formerly smoked, Currently smokes, or Unknown",
  },
} as const satisfies Record<string, FieldHelp>;

export type FieldHelpKey = keyof typeof FIELD_HELP;
