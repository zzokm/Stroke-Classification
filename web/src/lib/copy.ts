import type { RiskTier } from "./types";

export const TIER_SUMMARY: Record<
  RiskTier,
  { headline: string; body: string }
> = {
  Low: {
    headline: "Lower estimated risk",
    body: "Based on the information provided, the estimated stroke risk is in the lower range. Continue routine preventive care and regular check-ups with the care team.",
  },
  Medium: {
    headline: "Moderate estimated risk",
    body: "The estimated risk suggests enhanced monitoring may be helpful. Consider annual screening and lifestyle counseling with a healthcare provider.",
  },
  High: {
    headline: "Elevated estimated risk",
    body: "The estimated risk is elevated. Discuss these results with a clinician promptly for further assessment and preventive planning.",
  },
};

export const DISCLAIMER =
  "This tool provides a statistical screening estimate, not a medical diagnosis. Always consult a qualified healthcare provider.";

export const INTRO_COPY =
  "Enter routine health information to receive a calibrated stroke risk estimate. This takes about two minutes.";
