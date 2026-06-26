import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStepId } from "@/lib/types";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: WizardStepId;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);
  const stepCount = WIZARD_STEPS.length;
  const progressPct =
    stepCount > 1 ? (currentIndex / (stepCount - 1)) * 100 : 0;

  return (
    <nav aria-label="Screening progress" className="w-full">
      <ol className="relative grid w-full grid-cols-4">
        <div
          aria-hidden
          className="pointer-events-none absolute top-4 left-[12.5%] right-[12.5%] hidden h-0.5 -translate-y-1/2 sm:block"
        >
          <div className="absolute inset-0 rounded-full bg-border" />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-200 ease-out motion-reduce:transition-none"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {WIZARD_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isUpcoming = index > currentIndex;

          return (
            <li
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-2 text-center"
            >
              <span
                className={cn(
                  "relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200",
                  (isComplete || isCurrent) && "bg-brand text-white",
                  isUpcoming &&
                    "border border-border bg-background text-muted-foreground",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isComplete ? (
                  <Check className="size-4" strokeWidth={2.5} aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden max-w-[5.75rem] text-xs font-medium leading-tight sm:block",
                  isCurrent ? "text-brand" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-sm font-medium text-foreground sm:hidden">
        Step {currentIndex + 1} of {WIZARD_STEPS.length}:{" "}
        {WIZARD_STEPS[currentIndex]?.label}
      </p>
    </nav>
  );
}
