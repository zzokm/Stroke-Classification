"use client";

import { DISCLAIMER } from "@/lib/copy";
import { FieldLabel } from "@/components/ui/field-label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldErrors } from "@/lib/validation";
import type { PatientFormData } from "@/lib/types";

interface StepFieldsProps {
  form: PatientFormData;
  errors: FieldErrors;
  onChange: <K extends keyof PatientFormData>(
    key: K,
    value: PatientFormData[K],
  ) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function DemographicsStep({ form, errors, onChange }: StepFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FieldLabel htmlFor="gender" helpKey="gender">
          Gender
        </FieldLabel>
        <Select
          value={form.gender}
          onValueChange={(value) =>
            onChange("gender", value as PatientFormData["gender"])
          }
        >
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.gender} />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="age" helpKey="age">
          Age (years)
        </FieldLabel>
        <Input
          id="age"
          type="number"
          inputMode="numeric"
          min={0}
          max={120}
          placeholder="e.g. 67"
          value={form.age}
          onChange={(e) => onChange("age", e.target.value)}
        />
        <FieldError message={errors.age} />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="ever_married" helpKey="ever_married">
          Ever married
        </FieldLabel>
        <Select
          value={form.ever_married}
          onValueChange={(value) =>
            onChange("ever_married", value as PatientFormData["ever_married"])
          }
        >
          <SelectTrigger id="ever_married">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.ever_married} />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="work_type" helpKey="work_type">
          Work type
        </FieldLabel>
        <Select
          value={form.work_type}
          onValueChange={(value) =>
            onChange("work_type", value as PatientFormData["work_type"])
          }
        >
          <SelectTrigger id="work_type">
            <SelectValue placeholder="Select work type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Private">Private</SelectItem>
            <SelectItem value="Self-employed">Self-employed</SelectItem>
            <SelectItem value="Govt_job">Government job</SelectItem>
            <SelectItem value="children">Children</SelectItem>
            <SelectItem value="Never_worked">Never worked</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.work_type} />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="Residence_type" helpKey="Residence_type">
          Residence type
        </FieldLabel>
        <Select
          value={form.Residence_type}
          onValueChange={(value) =>
            onChange(
              "Residence_type",
              value as PatientFormData["Residence_type"],
            )
          }
        >
          <SelectTrigger id="Residence_type">
            <SelectValue placeholder="Select residence type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Urban">Urban</SelectItem>
            <SelectItem value="Rural">Rural</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.Residence_type} />
      </div>
    </div>
  );
}

export function ClinicalStep({ form, errors, onChange }: StepFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-4">
        <FieldLabel
          htmlFor="hypertension"
          helpKey="hypertension"
          className="text-base font-medium [&_label]:text-base [&_label]:font-medium"
        >
          Hypertension
        </FieldLabel>
        <Switch
          id="hypertension"
          checked={form.hypertension}
          onCheckedChange={(checked) =>
            onChange("hypertension", checked === true)
          }
          aria-label="Hypertension"
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-4">
        <FieldLabel
          htmlFor="heart_disease"
          helpKey="heart_disease"
          className="text-base font-medium [&_label]:text-base [&_label]:font-medium"
        >
          Heart disease
        </FieldLabel>
        <Switch
          id="heart_disease"
          checked={form.heart_disease}
          onCheckedChange={(checked) =>
            onChange("heart_disease", checked === true)
          }
          aria-label="Heart disease"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="avg_glucose_level" helpKey="avg_glucose_level">
          Average glucose level (mg/dL)
        </FieldLabel>
        <Input
          id="avg_glucose_level"
          type="number"
          inputMode="decimal"
          min={50}
          max={500}
          step="0.1"
          placeholder="e.g. 105.2"
          value={form.avg_glucose_level}
          onChange={(e) => onChange("avg_glucose_level", e.target.value)}
        />
        <FieldError message={errors.avg_glucose_level} />
      </div>
    </div>
  );
}

export function LifestyleStep({ form, errors, onChange }: StepFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FieldLabel htmlFor="bmi" helpKey="bmi">
          BMI (optional)
        </FieldLabel>
        <Input
          id="bmi"
          type="number"
          inputMode="decimal"
          min={10}
          max={80}
          step="0.1"
          placeholder="Leave blank if unknown"
          value={form.bmi}
          onChange={(e) => onChange("bmi", e.target.value)}
        />
        <FieldError message={errors.bmi} />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="smoking_status" helpKey="smoking_status">
          Smoking status
        </FieldLabel>
        <Select
          value={form.smoking_status}
          onValueChange={(value) =>
            onChange(
              "smoking_status",
              value as PatientFormData["smoking_status"],
            )
          }
        >
          <SelectTrigger id="smoking_status">
            <SelectValue placeholder="Select smoking status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never smoked">Never smoked</SelectItem>
            <SelectItem value="formerly smoked">Formerly smoked</SelectItem>
            <SelectItem value="smokes">Currently smokes</SelectItem>
            <SelectItem value="Unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.smoking_status} />
      </div>
    </div>
  );
}

interface ReviewStepProps {
  form: PatientFormData;
  onEdit: (stepIndex: number) => void;
}

export function ReviewStep({ form, onEdit }: ReviewStepProps) {
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Gender", value: form.gender, step: 0 },
    { label: "Age", value: `${form.age} years`, step: 0 },
    { label: "Ever married", value: form.ever_married, step: 0 },
    { label: "Work type", value: form.work_type.replace(/_/g, " "), step: 0 },
    { label: "Residence", value: form.Residence_type, step: 0 },
    {
      label: "Hypertension",
      value: form.hypertension ? "Yes" : "No",
      step: 1,
    },
    {
      label: "Heart disease",
      value: form.heart_disease ? "Yes" : "No",
      step: 1,
    },
    {
      label: "Average glucose",
      value: `${form.avg_glucose_level} mg/dL`,
      step: 1,
    },
    { label: "BMI", value: form.bmi.trim() ? form.bmi : "Not provided", step: 2 },
    { label: "Smoking status", value: form.smoking_status, step: 2 },
  ];

  return (
    <div className="space-y-6">
      <p className="text-base leading-relaxed text-muted-foreground">
        Review the information below before running the screening estimate.
      </p>
      <dl className="divide-y divide-border rounded-lg border border-border bg-card">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 px-4 py-3"
          >
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-0.5 text-base text-foreground">{row.value}</dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="shrink-0 text-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring rounded-sm"
            >
              Edit
            </button>
          </div>
        ))}
      </dl>
      <p className="no-print text-sm leading-relaxed text-muted-foreground">
        {DISCLAIMER}
      </p>
    </div>
  );
}
