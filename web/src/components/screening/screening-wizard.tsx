"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/screening/app-header";
import { ResultsPanel } from "@/components/screening/results-panel";
import { StepIndicator } from "@/components/screening/step-indicator";
import {
  ClinicalStep,
  DemographicsStep,
  LifestyleStep,
  ReviewStep,
} from "@/components/screening/wizard-steps";
import { Button } from "@/components/ui/button";
import { predictStrokeRisk, ApiError } from "@/lib/api";
import { INTRO_COPY } from "@/lib/copy";
import {
  INITIAL_FORM,
  WIZARD_STEPS,
  type PatientFormData,
  type PredictionResult,
  type WizardStepId,
} from "@/lib/types";
import {
  toPatientPayload,
  validateStep,
  type FieldErrors,
} from "@/lib/validation";
import { consumeScreeningPrefill } from "@/lib/prefill";
import { SamplePatientLoader } from "@/components/screening/sample-patient-loader";

const STEP_TITLES: Record<WizardStepId, string> = {
  demographics: "Patient demographics",
  clinical: "Clinical history",
  lifestyle: "Lifestyle factors",
  review: "Review and submit",
};

function readWizardBootstrap(): {
  form: PatientFormData;
  prefillNotice: string | null;
} {
  if (typeof window === "undefined") {
    return { form: INITIAL_FORM, prefillNotice: null };
  }

  const prefill = consumeScreeningPrefill();
  if (!prefill) {
    return { form: INITIAL_FORM, prefillNotice: null };
  }

  return {
    form: prefill.form,
    prefillNotice: prefill.label
      ? `Loaded sample profile: ${prefill.label}. Review the fields, then run screening.`
      : "Loaded sample profile. Review the fields, then run screening.",
  };
}

export function ScreeningWizard() {
  const [wizardBootstrap] = useState(readWizardBootstrap);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(wizardBootstrap.form);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [prefillNotice, setPrefillNotice] = useState(wizardBootstrap.prefillNotice);

  const currentStep = WIZARD_STEPS[stepIndex]?.id ?? "demographics";

  const updateField = useCallback(
    <K extends keyof PatientFormData>(key: K, value: PatientFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const loadSample = useCallback((nextForm: PatientFormData, label: string) => {
    setForm(nextForm);
    setErrors({});
    setResult(null);
    setSubmitError(null);
    setStepIndex(0);
    setPrefillNotice(
      `Loaded sample profile: ${label}. Review the fields, then run screening.`,
    );
  }, []);

  const goToStep = (index: number) => {
    setStepIndex(Math.max(0, Math.min(index, WIZARD_STEPS.length - 1)));
    setSubmitError(null);
  };

  const handleNext = async () => {
    const stepErrors = validateStep(currentStep, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    if (currentStep !== "review") {
      goToStep(stepIndex + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = toPatientPayload(form);
      const prediction = await predictStrokeRisk(payload);
      setResult(prediction);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "We couldn't reach the screening service. Check that the API is running.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setResult(null);
    setSubmitError(null);
    setStepIndex(0);
  };

  if (result) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 pb-28 sm:px-6 sm:py-10">
          <ResultsPanel result={result} />
        </main>
        <footer className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm no-print">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:px-6">
            <Button type="button" size="lg" onClick={handleReset} className="sm:flex-1">
              Screen another patient
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => window.print()}
              className="sm:flex-1"
            >
              Print summary
            </Button>
          </div>
        </footer>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8">
          {prefillNotice && (
            <div
              role="status"
              className="rounded-lg border border-accent/25 bg-accent-light px-4 py-3 text-sm text-foreground"
            >
              {prefillNotice}
            </div>
          )}
          {stepIndex === 0 && (
            <p className="text-base leading-relaxed text-muted-foreground max-w-prose">
              {INTRO_COPY}
            </p>
          )}

          <StepIndicator currentStep={currentStep} />

          <div className="space-y-6">
            <h2 className="text-[1.375rem] font-semibold leading-tight text-foreground">
              {STEP_TITLES[currentStep]}
            </h2>

            {currentStep === "demographics" && (
              <DemographicsStep
                form={form}
                errors={errors}
                onChange={updateField}
              />
            )}
            {currentStep === "clinical" && (
              <ClinicalStep
                form={form}
                errors={errors}
                onChange={updateField}
              />
            )}
            {currentStep === "lifestyle" && (
              <LifestyleStep
                form={form}
                errors={errors}
                onChange={updateField}
              />
            )}
            {currentStep === "review" && (
              <ReviewStep form={form} onEdit={goToStep} />
            )}

            {submitError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground"
              >
                {submitError}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm no-print">
        <div className="mx-auto max-w-3xl border-b border-border/60 px-4 py-3 sm:px-6">
          <SamplePatientLoader onLoad={loadSample} />
        </div>
        <div className="mx-auto flex max-w-3xl gap-3 px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={stepIndex === 0 || submitting}
            className="min-w-24"
          >
            Back
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleNext}
            disabled={submitting}
            className="flex-1 gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Calculating risk…
              </>
            ) : currentStep === "review" ? (
              "Run screening"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </footer>
    </>
  );
}
