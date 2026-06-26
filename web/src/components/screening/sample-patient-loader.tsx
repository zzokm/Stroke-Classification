"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchModelReport } from "@/lib/api";
import { generateLogicalPatient } from "@/lib/logical-patient";
import type { PatientPreset } from "@/lib/model-report";
import { payloadToForm } from "@/lib/prefill";
import type { PatientFormData } from "@/lib/types";
import { cn } from "@/lib/utils";

const GENERATED_LABEL = "Random logical profile";

interface SamplePatientLoaderProps {
  onLoad: (form: PatientFormData, label: string) => void;
  prominent?: boolean;
}

export function SamplePatientLoader({
  onLoad,
  prominent = false,
}: SamplePatientLoaderProps) {
  const [presets, setPresets] = useState<PatientPreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [selection, setSelection] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchModelReport()
      .then((report) => {
        if (!cancelled) setPresets(report.presets);
      })
      .catch(() => {
        if (!cancelled) setPresets([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPresets(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoad = () => {
    if (!selection) return;

    setLoading(true);
    try {
      if (selection === GENERATED_LABEL) {
        const patient = generateLogicalPatient("auto", Date.now());
        onLoad(payloadToForm(patient), "Generated logical profile");
        return;
      }

      const preset = presets.find((p) => p.label === selection);
      if (!preset) return;
      onLoad(payloadToForm(preset.patient), preset.label);
    } finally {
      setLoading(false);
    }
  };

  const controls = (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
      <Select
        value={selection}
        onValueChange={(value) => setSelection(value ?? "")}
        disabled={loadingPresets}
      >
        <SelectTrigger
          size={prominent ? "default" : "sm"}
          className="min-w-0 flex-1"
        >
          <SelectValue placeholder="Choose a sample profile…" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.id} value={preset.label}>
              {preset.label}
            </SelectItem>
          ))}
          <SelectItem value={GENERATED_LABEL}>{GENERATED_LABEL}</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size={prominent ? "default" : "sm"}
        disabled={!selection || loading || loadingPresets}
        onClick={handleLoad}
        className="shrink-0 gap-1.5"
      >
        {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
        Load profile
      </Button>
    </div>
  );

  if (prominent) {
    return (
      <section
        aria-labelledby="sample-patient-heading"
        className="rounded-lg border border-border bg-card p-4 sm:p-5"
      >
        <div className="mb-3 space-y-1">
          <h3
            id="sample-patient-heading"
            className="text-sm font-semibold text-foreground"
          >
            Try a sample profile
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Load preset patient data to explore the screening flow without
            manual entry.
          </p>
        </div>
        {controls}
      </section>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center")}>
      <p className="shrink-0 text-xs font-medium text-muted-foreground sm:w-28">
        Sample patient
      </p>
      {controls}
    </div>
  );
}
