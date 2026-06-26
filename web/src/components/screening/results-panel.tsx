"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TIER_SUMMARY, DISCLAIMER } from "@/lib/copy";
import { RiskProbabilityScale } from "@/components/screening/risk-probability-scale";
import { formatPercent } from "@/lib/validation";
import type { PredictionResult, RiskTier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResultsPanelProps {
  result: PredictionResult;
}

const tierStyles: Record<
  RiskTier,
  { badge: string; label: string }
> = {
  Low: {
    badge: "bg-risk-low text-white border-transparent",
    label: "Low risk",
  },
  Medium: {
    badge: "bg-risk-medium text-white border-transparent",
    label: "Medium risk",
  },
  High: {
    badge: "bg-risk-high text-white border-transparent",
    label: "High risk",
  },
};

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [clinicalOpen, setClinicalOpen] = useState(false);
  const tier = tierStyles[result.risk_tier];
  const summary = TIER_SUMMARY[result.risk_tier];

  return (
    <section
      aria-live="polite"
      className="result-reveal space-y-8"
    >
      <div className="space-y-4">
        <h2 className="text-[1.375rem] font-semibold leading-tight text-foreground">
          Your screening result
        </h2>
        <Badge
          className={cn(
            "px-3 py-1 text-sm font-semibold",
            tier.badge,
          )}
        >
          {tier.label}
        </Badge>
        <div className="space-y-2 max-w-prose">
          <p className="text-lg font-semibold text-foreground">
            {summary.headline}
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            {summary.body}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <RiskProbabilityScale
          probability={result.stroke_probability}
          thresholds={result.thresholds}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Recommended action
        </p>
        <p className="text-base leading-relaxed text-foreground">
          {result.recommended_action}
        </p>
      </div>

      <Collapsible open={clinicalOpen} onOpenChange={setClinicalOpen}>
        <CollapsibleTrigger
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-card focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
          aria-expanded={clinicalOpen}
        >
          Clinical details
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              clinicalOpen && "rotate-180",
            )}
            aria-hidden
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4 rounded-lg border border-border bg-card p-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="Model"
              value={result.model_metrics.best_model.replace(/_/g, " ")}
            />
            <DetailItem
              label="Alert triggered"
              value={result.alert_triggered ? "Yes" : "No"}
            />
            <DetailItem
              label="High risk threshold"
              value={formatPercent(result.thresholds.high_risk_min_probability)}
            />
            <DetailItem
              label="Medium risk threshold"
              value={formatPercent(result.thresholds.medium_risk_min_probability)}
            />
            <DetailItem
              label="Hold-out PR-AUC"
              value={result.model_metrics.pr_auc.toFixed(3)}
            />
            <DetailItem
              label="Brier score"
              value={result.model_metrics.brier_score.toFixed(3)}
            />
            <DetailItem
              label="Recall (hold-out)"
              value={formatPercent(result.model_metrics.recall)}
            />
            <DetailItem
              label="Balanced accuracy"
              value={formatPercent(result.model_metrics.balanced_accuracy)}
            />
          </dl>
          <p className="text-sm text-muted-foreground">
            Thresholds and metrics are loaded from the deployed model metadata
            and reflect validation performance on held-out data.
          </p>
        </CollapsibleContent>
      </Collapsible>

      <p className="no-print text-sm leading-relaxed text-muted-foreground max-w-prose">
        {DISCLAIMER}
      </p>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}
