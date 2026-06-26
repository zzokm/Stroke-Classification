import { formatLabel } from "@/lib/validation";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export const GENDER_OPTIONS = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
] as const satisfies readonly SelectOption[];

export const EVER_MARRIED_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
] as const satisfies readonly SelectOption[];

export const WORK_TYPE_OPTIONS = [
  { value: "Private", label: "Private" },
  { value: "Self-employed", label: "Self-employed" },
  { value: "Govt_job", label: "Government job" },
  { value: "children", label: "Children" },
  { value: "Never_worked", label: "Never worked" },
] as const satisfies readonly SelectOption[];

export const RESIDENCE_TYPE_OPTIONS = [
  { value: "Urban", label: "Urban" },
  { value: "Rural", label: "Rural" },
] as const satisfies readonly SelectOption[];

export const SMOKING_STATUS_OPTIONS = [
  { value: "never smoked", label: "Never smoked" },
  { value: "formerly smoked", label: "Formerly smoked" },
  { value: "smokes", label: "Currently smokes" },
  { value: "Unknown", label: "Unknown" },
] as const satisfies readonly SelectOption[];

export const PATIENT_ARCHETYPE_OPTIONS = [
  { value: "auto", label: "Auto (mixed)" },
  { value: "low", label: "Low risk band" },
  { value: "moderate", label: "Moderate risk band" },
  { value: "high", label: "High risk band" },
] as const satisfies readonly SelectOption[];

export function getOptionLabel(
  options: readonly SelectOption[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? formatLabel(value);
}
