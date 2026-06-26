"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { predictStrokeRisk } from "@/lib/api";
import {
  generateLogicalPatient,
  type PatientArchetype,
} from "@/lib/logical-patient";
import type { PatientPreset } from "@/lib/model-report";
import { saveScreeningPrefill } from "@/lib/prefill";
import type { PatientPayload, PredictionResult } from "@/lib/types";
import { formatPercent } from "@/lib/validation";

function PatientSummary({ patient }: { patient: PatientPayload }) {
  return (
    <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-muted-foreground">Age / gender</dt>
        <dd className="font-medium text-foreground">
          {patient.age} · {patient.gender}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Glucose / BMI</dt>
        <dd className="font-medium text-foreground">
          {patient.avg_glucose_level} mg/dL ·{" "}
          {patient.bmi != null ? patient.bmi : "—"}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Hypertension / heart disease</dt>
        <dd className="font-medium text-foreground">
          {patient.hypertension ? "Yes" : "No"} /{" "}
          {patient.heart_disease ? "Yes" : "No"}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Smoking</dt>
        <dd className="font-medium capitalize text-foreground">
          {patient.smoking_status}
        </dd>
      </div>
    </dl>
  );
}

interface PresetCardProps {
  preset: PatientPreset;
}

function PresetCard({ preset }: PresetCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const prediction = await predictStrokeRisk(preset.patient);
      setResult(prediction);
    } catch {
      setError("Prediction unavailable. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-foreground">{preset.label}</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {preset.description}
        </p>
      </div>
      <PatientSummary patient={preset.patient} />
      {result && (
        <p className="text-sm text-foreground">
          Predicted{" "}
          <span className="font-semibold tabular-nums">
            {formatPercent(result.stroke_probability)}
          </span>{" "}
          · {result.risk_tier} risk
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={runPredict}
          className="gap-2"
        >
          {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          Show prediction
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            saveScreeningPrefill(preset.patient, preset.label);
            router.push("/");
          }}
        >
          Load into screening
        </Button>
      </div>
    </article>
  );
}

interface SamplePatientsSectionProps {
  presets: PatientPreset[];
}

export function SamplePatientsSection({ presets }: SamplePatientsSectionProps) {
  const router = useRouter();
  const [archetype, setArchetype] = useState<PatientArchetype>("auto");
  const [seed, setSeed] = useState(42);
  const [generated, setGenerated] = useState<PatientPayload>(() =>
    generateLogicalPatient("auto", 42),
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const regenerate = (nextSeed?: number) => {
    const s = nextSeed ?? Date.now();
    setSeed(s);
    setGenerated(generateLogicalPatient(archetype, s));
    setResult(null);
    setError(null);
  };

  const runPredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const prediction = await predictStrokeRisk(generated);
      setResult(prediction);
    } catch {
      setError("Prediction unavailable. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Named presets</h3>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
          Fixed profiles from notebook archetypes and one hold-out test row. Load
          any preset into the screening wizard or preview its prediction here.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {presets.map((preset) => (
            <PresetCard key={preset.id} preset={preset} />
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            Generate logical profile
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
            Profiles are built archetype-first: age bands, comorbidities, glucose,
            and BMI are drawn from correlated ranges — not independent random fields.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5 flex-1 max-w-xs">
            <label htmlFor="archetype" className="text-sm font-medium text-foreground">
              Risk archetype
            </label>
            <Select
              value={archetype}
              onValueChange={(v) => setArchetype(v as PatientArchetype)}
            >
              <SelectTrigger id="archetype">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (mixed)</SelectItem>
                <SelectItem value="low">Low risk band</SelectItem>
                <SelectItem value="moderate">Moderate risk band</SelectItem>
                <SelectItem value="high">High risk band</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => regenerate()}>
              Regenerate
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => regenerate(seed)}
              title={`Reproducible seed ${seed}`}
            >
              Seed {seed}
            </Button>
          </div>
        </div>

        <PatientSummary patient={generated} />

        {result && (
          <p className="text-sm text-foreground">
            Predicted{" "}
            <span className="font-semibold tabular-nums">
              {formatPercent(result.stroke_probability)}
            </span>{" "}
            · {result.risk_tier} risk
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={runPredict}
            className="gap-2"
          >
            {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
            Show prediction
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              saveScreeningPrefill(generated, "Generated logical profile");
              router.push("/");
            }}
          >
            Load into screening
          </Button>
        </div>
      </div>
    </div>
  );
}
