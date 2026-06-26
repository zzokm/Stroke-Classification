import type { PatientPayload } from "./types";

export type PatientArchetype = "auto" | "low" | "moderate" | "high";

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function chance(rng: () => number, p: number): boolean {
  return rng() < p;
}

function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function glucoseBand(
  archetype: Exclude<PatientArchetype, "auto">,
  rng: () => number,
): { min: number; max: number } {
  const roll = rng();
  if (archetype === "low") {
    if (roll < 0.85) return { min: 70, max: 110 };
    return { min: 110, max: 139 };
  }
  if (archetype === "moderate") {
    if (roll < 0.45) return { min: 110, max: 139 };
    if (roll < 0.85) return { min: 140, max: 180 };
    return { min: 70, max: 110 };
  }
  if (roll < 0.25) return { min: 140, max: 180 };
  if (roll < 0.7) return { min: 180, max: 250 };
  return { min: 110, max: 139 };
}

function bmiForGlucose(
  glucose: number,
  archetype: Exclude<PatientArchetype, "auto">,
  rng: () => number,
): number {
  if (glucose >= 180) return round1(range(rng, 30, 40));
  if (glucose >= 140) return round1(range(rng, 25, 34));
  if (archetype === "high") return round1(range(rng, 26, 36));
  if (archetype === "moderate") return round1(range(rng, 23, 31));
  return round1(range(rng, 18, 26));
}

function resolveArchetype(
  choice: PatientArchetype,
  rng: () => number,
): Exclude<PatientArchetype, "auto"> {
  if (choice !== "auto") return choice;
  const roll = rng();
  if (roll < 0.34) return "low";
  if (roll < 0.67) return "moderate";
  return "high";
}

export function generateLogicalPatient(
  archetype: PatientArchetype = "auto",
  seed?: number,
): PatientPayload {
  const rng = mulberry32(seed ?? Date.now());
  const tier = resolveArchetype(archetype, rng);

  const age =
    tier === "low"
      ? Math.round(range(rng, 25, 45))
      : tier === "moderate"
        ? Math.round(range(rng, 45, 65))
        : Math.round(range(rng, 62, 82));

  const hypertension =
    tier === "low"
      ? chance(rng, age > 40 ? 0.15 : 0.05)
        ? 1
        : 0
      : tier === "moderate"
        ? chance(rng, 0.55)
          ? 1
          : 0
        : chance(rng, 0.78)
          ? 1
          : 0;

  const heart_disease =
    hypertension === 1 && age > 60
      ? chance(rng, tier === "high" ? 0.45 : 0.22)
        ? 1
        : 0
      : tier === "high" && age > 70
        ? chance(rng, 0.3)
          ? 1
          : 0
        : chance(rng, tier === "high" ? 0.18 : 0.06)
          ? 1
          : 0;

  const gBand = glucoseBand(tier, rng);
  const avg_glucose_level = round1(range(rng, gBand.min, gBand.max));
  const bmi = bmiForGlucose(avg_glucose_level, tier, rng);

  const smoking_status =
    tier === "low"
      ? pick(rng, ["never smoked", "never smoked", "formerly smoked", "Unknown"])
      : tier === "moderate"
        ? pick(rng, [
            "never smoked",
            "formerly smoked",
            "formerly smoked",
            "smokes",
          ])
        : pick(rng, [
            "formerly smoked",
            "formerly smoked",
            "smokes",
            "smokes",
            "never smoked",
          ]);

  const gender = pick(rng, ["Female", "Male"] as const);
  const ever_married = age > 22 && chance(rng, 0.88) ? "Yes" : "No";

  let work_type: PatientPayload["work_type"];
  if (age < 18) {
    work_type = "children";
  } else if (age > 65) {
    work_type = pick(rng, ["Private", "Govt_job", "Self-employed"]);
  } else {
    work_type = pick(rng, [
      "Private",
      "Private",
      "Govt_job",
      "Self-employed",
      "Never_worked",
    ]);
  }

  return {
    gender,
    age,
    hypertension: hypertension as 0 | 1,
    heart_disease: heart_disease as 0 | 1,
    ever_married: ever_married as PatientPayload["ever_married"],
    work_type,
    Residence_type: pick(rng, ["Urban", "Rural"]),
    avg_glucose_level,
    bmi,
    smoking_status: smoking_status as PatientPayload["smoking_status"],
  };
}
