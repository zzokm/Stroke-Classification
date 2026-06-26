"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ModelReport } from "@/lib/model-report";
import { formatFeatureName } from "@/lib/model-report";
import { formatPercent } from "@/lib/validation";

const COLORS = {
  primary: "#00ad83",
  brandDark: "#006b51",
  medium: "oklch(0.62 0.14 75)",
  high: "oklch(0.42 0.12 25)",
  muted: "oklch(0.48 0.02 166)",
  stroke: "oklch(0.42 0.12 25)",
  noStroke: "#006b51",
};

const MODEL_LINE_COLORS = [
  COLORS.primary,
  COLORS.brandDark,
  COLORS.medium,
  COLORS.muted,
];

const AXIS_TICK = { fill: "oklch(0.48 0.02 166)", fontSize: 12 };
const AXIS_TICK_DARK = { fill: "oklch(0.22 0.02 166)", fontSize: 13 };

const CHART_MARGIN = {
  bar: { top: 16, right: 16, left: 48, bottom: 28 },
  line: { top: 16, right: 20, left: 12, bottom: 52 },
  lineWithYLabel: { top: 16, right: 20, left: 56, bottom: 52 },
  lineWithLegend: { top: 16, right: 20, left: 56, bottom: 64 },
  horizontalBar: { top: 8, right: 24, left: 8, bottom: 48 },
} as const;

function xAxisLabel(value: string, offset = 4) {
  return {
    value,
    position: "bottom" as const,
    offset,
    fill: AXIS_TICK.fill,
    fontSize: AXIS_TICK.fontSize,
  };
}

function yAxisLabel(value: string, offset = 8) {
  return {
    value,
    angle: -90,
    position: "left" as const,
    offset,
    fill: AXIS_TICK.fill,
    fontSize: AXIS_TICK.fontSize,
  };
}

interface ChartFrameProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  height?: number;
}

function ChartFrame({
  title,
  description,
  children,
  height = 320,
}: ChartFrameProps) {
  return (
    <figure className="space-y-3">
      <figcaption>
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-prose">
            {description}
          </p>
        )}
      </figcaption>
      <div style={{ minHeight: height }} className="w-full">
        {children}
      </div>
    </figure>
  );
}

export function ClassBalanceChart({
  data,
}: {
  data: ModelReport["charts"]["class_balance"];
}) {
  return (
    <ChartFrame
      title="Class balance in cleaned dataset"
      description="Stroke events are rare (~5%). Metrics emphasize recall and PR-AUC over raw accuracy."
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={CHART_MARGIN.bar}>
          <CartesianGrid stroke="oklch(0.88 0.008 165)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK_DARK}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={48}
            label={yAxisLabel("Record count", 4)}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid oklch(0.88 0.008 165)",
              fontSize: 13,
            }}
            formatter={(value) => [
              Number(value).toLocaleString(),
              "Records",
            ]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={120}>
            {data.map((entry) => (
              <Cell
                key={entry.label}
                fill={
                  entry.label.toLowerCase().includes("stroke") &&
                  !entry.label.toLowerCase().includes("no")
                    ? COLORS.stroke
                    : COLORS.noStroke
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function PrCurvesChart({
  curves,
}: {
  curves: ModelReport["charts"]["pr_curves"];
}) {
  const merged = new Map<number, Record<string, number>>();
  for (const curve of curves) {
    for (const point of curve.points) {
      const key = Math.round(point.recall * 1000) / 1000;
      const row = merged.get(key) ?? { recall: point.recall };
      row[curve.model] = point.precision;
      merged.set(key, row);
    }
  }
  const data = Array.from(merged.values()).sort((a, b) => a.recall - b.recall);

  return (
    <ChartFrame
      title="Precision–recall curves (hold-out test)"
      description="Primary metric for imbalanced stroke detection. Solid line: deployed Random Forest."
    >
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={CHART_MARGIN.lineWithLegend}>
          <CartesianGrid stroke="oklch(0.88 0.008 165)" />
          <XAxis
            type="number"
            dataKey="recall"
            domain={[0, 1]}
            tickFormatter={(v) => formatPercent(v)}
            tick={AXIS_TICK}
            label={xAxisLabel("Recall")}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v) => formatPercent(v)}
            tick={AXIS_TICK}
            width={48}
            label={yAxisLabel("Precision")}
          />
          <Tooltip
            formatter={(value, name) => [
              formatPercent(Number(value)),
              curves.find((c) => c.model === name)?.label ?? String(name),
            ]}
            labelFormatter={(label) => `Recall ${formatPercent(Number(label))}`}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid oklch(0.88 0.008 165)",
              fontSize: 13,
            }}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 12 }}
            formatter={(value) =>
              curves.find((c) => c.model === value)?.label ?? value
            }
          />
          {curves.map((curve, index) => (
            <Line
              key={curve.model}
              type="monotone"
              dataKey={curve.model}
              name={curve.model}
              stroke={MODEL_LINE_COLORS[index % MODEL_LINE_COLORS.length]}
              strokeWidth={curve.model === "random_forest" ? 2.5 : 1.5}
              strokeDasharray={curve.approximate ? "6 4" : undefined}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function CalibrationChart({
  series,
}: {
  series: ModelReport["charts"]["calibration"];
}) {
  const points = series[0]?.points ?? [];
  const data = points.map((p) => ({
    predicted: p.mean_predicted,
    observed: p.fraction_positive,
  }));
  const reference = [
    { predicted: 0, observed: 0 },
    { predicted: 1, observed: 1 },
  ];

  return (
    <ChartFrame
      title="Calibration (Random Forest)"
      description="Predicted probabilities vs observed stroke rate per bin. Closer to the diagonal means better calibration."
    >
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={CHART_MARGIN.lineWithYLabel}>
          <CartesianGrid stroke="oklch(0.88 0.008 165)" />
          <XAxis
            type="number"
            dataKey="predicted"
            domain={[0, 1]}
            tickFormatter={(v) => formatPercent(v)}
            tick={AXIS_TICK}
            label={xAxisLabel("Mean predicted probability")}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v) => formatPercent(v)}
            tick={AXIS_TICK}
            width={48}
            label={yAxisLabel("Observed stroke rate")}
          />
          <Tooltip
            formatter={(value) => [
              formatPercent(Number(value)),
              "Observed rate",
            ]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { predicted?: number } | undefined;
              return p?.predicted != null
                ? `Predicted ${formatPercent(p.predicted)}`
                : "";
            }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid oklch(0.88 0.008 165)",
              fontSize: 13,
            }}
          />
          <ReferenceLine
            segment={[
              { x: 0, y: 0 },
              { x: 1, y: 1 },
            ]}
            stroke="oklch(0.72 0.02 165)"
            strokeDasharray="4 4"
          />
          <Line
            data={reference}
            type="linear"
            dataKey="observed"
            stroke="transparent"
            dot={false}
            legendType="none"
          />
          <Line
            type="monotone"
            dataKey="observed"
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ r: 4, fill: COLORS.primary }}
            name="Observed rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function ConfusionMatrixChart({
  matrix,
}: {
  matrix: ModelReport["charts"]["confusion_matrix"];
}) {
  const [negLabel, posLabel] = matrix.labels;
  const [[tn, fp], [fn, tp]] = matrix.matrix;
  const cells = [
    { label: `True ${negLabel}`, value: tn, tone: "low" as const },
    { label: `False ${posLabel}`, value: fp, tone: "medium" as const },
    { label: `Missed ${posLabel}`, value: fn, tone: "high" as const },
    { label: `True ${posLabel}`, value: tp, tone: "primary" as const },
  ];
  const max = Math.max(tn, fp, fn, tp, 1);

  const toneBg = {
    low: "bg-primary/10 text-foreground",
    medium: "bg-risk-medium/25 text-foreground",
    high: "bg-risk-high/15 text-foreground",
    primary: "bg-accent-light text-foreground",
  };

  return (
    <ChartFrame
      title="Confusion matrix at decision threshold"
      description="Random Forest on the 20% hold-out split. Recall prioritizes catching stroke cases."
    >
      <div className="grid grid-cols-2 gap-3 max-w-md">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={`rounded-lg border border-border p-4 ${toneBg[cell.tone]}`}
            style={{
              opacity: 0.55 + (cell.value / max) * 0.45,
            }}
          >
            <p className="text-xs font-medium text-muted-foreground">{cell.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{cell.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Predicted {posLabel}: {fp + tp} · Actual {posLabel}: {fn + tp} · Recall{" "}
        {formatPercent(tp / (fn + tp))}
      </p>
    </ChartFrame>
  );
}

export function FeatureImportanceChart({
  features,
}: {
  features: ModelReport["charts"]["feature_importance"];
}) {
  const data = [...features]
    .filter((f) => f.importance > 0)
    .map((f) => ({
      feature: formatFeatureName(f.feature),
      importance: f.importance,
    }))
    .reverse();

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Feature importance data was not exported for this build.
      </p>
    );
  }

  return (
    <ChartFrame
      title="Top 15 Random Forest importances"
      description="Engineered cardiovascular score and age dominate; categorical BMI and marital status contribute after preprocessing."
    >
      <ResponsiveContainer width="100%" height={Math.max(320, data.length * 28)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={CHART_MARGIN.horizontalBar}
        >
          <CartesianGrid stroke="oklch(0.88 0.008 165)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={AXIS_TICK}
            domain={[0, "dataMax"]}
            label={xAxisLabel("Relative importance")}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={168}
            tick={AXIS_TICK_DARK}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [
              `${(Number(value) * 100).toFixed(1)}%`,
              "Importance",
            ]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid oklch(0.88 0.008 165)",
              fontSize: 13,
            }}
          />
          <Bar dataKey="importance" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
