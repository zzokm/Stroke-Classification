import { formatPercent } from "@/lib/validation";
import type { Thresholds } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RiskProbabilityScaleProps {
  probability: number;
  thresholds: Thresholds;
  className?: string;
}

export function RiskProbabilityScale({
  probability,
  thresholds,
  className,
}: RiskProbabilityScaleProps) {
  const medium = thresholds.medium_risk_min_probability * 100;
  const high = thresholds.high_risk_min_probability * 100;
  const marker = Math.min(100, Math.max(0, probability * 100));
  const markerLeft = Math.min(98, Math.max(2, marker));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          Estimated stroke probability
        </p>
        <p
          className="text-3xl font-semibold leading-none tabular-nums text-foreground"
          aria-hidden
        >
          {formatPercent(probability)}
        </p>
      </div>

      <div
        role="img"
        aria-label={`Estimated stroke probability ${formatPercent(probability)} on a scale from low to high risk`}
        className="space-y-3"
      >
        <div className="relative py-2">
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            <div
              className="bg-risk-low"
              style={{ width: `${medium}%` }}
              title={`Low risk below ${formatPercent(thresholds.medium_risk_min_probability)}`}
            />
            <div
              className="bg-risk-medium"
              style={{ width: `${high - medium}%` }}
              title={`Medium risk ${formatPercent(thresholds.medium_risk_min_probability)}–${formatPercent(thresholds.high_risk_min_probability)}`}
            />
            <div
              className="bg-risk-high"
              style={{ width: `${100 - high}%` }}
              title={`High risk from ${formatPercent(thresholds.high_risk_min_probability)}`}
            />
          </div>

          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${markerLeft}%` }}
            aria-hidden
          >
            <div className="h-7 w-2.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.28)] ring-1 ring-black/10" />
          </div>

          <div
            className="pointer-events-none absolute top-0 h-3 w-px -translate-x-px bg-foreground/25"
            style={{ left: `${medium}%` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute top-0 h-3 w-px -translate-x-px bg-foreground/25"
            style={{ left: `${high}%` }}
            aria-hidden
          />
        </div>

        <div className="relative h-4 text-xs text-muted-foreground">
          <span className="absolute left-0">0%</span>
          <span
            className="absolute -translate-x-1/2 tabular-nums"
            style={{ left: `${medium}%` }}
          >
            {formatPercent(thresholds.medium_risk_min_probability)}
          </span>
          <span
            className="absolute -translate-x-1/2 tabular-nums"
            style={{ left: `${high}%` }}
          >
            {formatPercent(thresholds.high_risk_min_probability)}
          </span>
          <span className="absolute right-0">100%</span>
        </div>

        <div className="flex text-xs font-medium">
          <span
            className="text-risk-low"
            style={{ width: `${medium}%` }}
          >
            Low
          </span>
          <span
            className="text-risk-medium"
            style={{ width: `${high - medium}%` }}
          >
            Medium
          </span>
          <span
            className="text-risk-high"
            style={{ width: `${100 - high}%` }}
          >
            High
          </span>
        </div>
      </div>
    </div>
  );
}
