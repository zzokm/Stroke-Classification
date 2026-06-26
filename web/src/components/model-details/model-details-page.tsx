"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/screening/app-header";
import {
  CalibrationChart,
  ClassBalanceChart,
  ConfusionMatrixChart,
  FeatureImportanceChart,
  PrCurvesChart,
} from "@/components/model-details/model-charts";
import { SamplePatientsSection } from "@/components/model-details/sample-patients";
import {
  MobileJumpMenu,
  scrollToSection,
  TocNav,
  useScrollSpy,
} from "@/components/model-details/toc-nav";
import { ApiError, fetchModelReport } from "@/lib/api";
import {
  MODEL_SECTIONS,
  type ModelReport,
  type ModelSectionId,
} from "@/lib/model-report";
import { formatPercent } from "@/lib/validation";
import { cn } from "@/lib/utils";

function Section({
  id,
  title,
  children,
}: {
  id: ModelSectionId;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-[calc(var(--app-header-height,72px)+1.25rem)] space-y-5"
    >
      <h2 className="text-[1.375rem] font-semibold leading-tight text-foreground text-balance">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FactsTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-border last:border-0">
              <th
                scope="row"
                className="px-4 py-3 text-left font-medium text-muted-foreground w-2/5"
              >
                {label}
              </th>
              <td className="px-4 py-3 text-foreground tabular-nums">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-2/3 rounded bg-muted" />
      <div className="h-32 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  );
}

export function ModelDetailsPage() {
  const [report, setReport] = useState<ModelReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sectionIds = useMemo(
    () => MODEL_SECTIONS.map((s) => s.id),
    [],
  );
  const activeId = useScrollSpy(sectionIds);

  useEffect(() => {
    fetchModelReport()
      .then(setReport)
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load model report.",
        );
      });
  }, []);

  const metrics = report?.deployment.best_model_metrics;
  const thresholds = report?.deployment.risk_thresholds;

  return (
    <>
      <AppHeader wide />
      <div className="mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 space-y-3 max-w-prose">
          <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-semibold leading-tight text-foreground text-balance">
            Model details
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Technical reference for the deployed stroke classifier — dataset,
            pipeline, evaluation, and sample patients for grading demos.
          </p>
        </div>

        <MobileJumpMenu
          activeId={activeId}
          onJump={scrollToSection}
        />

        <div className="mt-8 flex gap-10 lg:mt-10">
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-[calc(var(--app-header-height,72px)+1rem)]">
              <TocNav
                activeId={activeId}
                onJump={scrollToSection}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-16 max-w-3xl">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground"
              >
                {error}
              </div>
            )}

            {!report && !error && <LoadingSkeleton />}

            {report && (
              <>
                <Section id="overview" title="At a glance">
                  <p className="text-base leading-relaxed text-muted-foreground max-w-prose">
                    Binary stroke classification on routine health records. The
                    deployed model is a{" "}
                    <strong className="font-semibold text-foreground">
                      Random Forest
                    </strong>{" "}
                    pipeline with SMOTE resampling, selected for the best
                    recall–calibration tradeoff on imbalanced hold-out data.
                  </p>
                  <FactsTable
                    rows={[
                      ["Hold-out PR-AUC", formatPercent(metrics?.pr_auc ?? 0)],
                      ["Recall (stroke class)", formatPercent(metrics?.recall ?? 0)],
                      ["Brier score", (metrics?.brier_score ?? 0).toFixed(3)],
                      [
                        "Decision threshold",
                        formatPercent(thresholds?.decision_threshold ?? 0),
                      ],
                      [
                        "Cleaned records",
                        report.dataset.rows_clean.toLocaleString(),
                      ],
                      [
                        "Stroke prevalence",
                        `${report.dataset.prevalence_pct}%`,
                      ],
                      [
                        "Train / test split",
                        `${report.dataset.train_total} / ${report.dataset.test_total}`,
                      ],
                    ]}
                  />
                  <p>
                    <Link
                      href="/"
                      className="text-sm font-medium text-brand underline-offset-4 hover:underline"
                    >
                      Run a screening →
                    </Link>
                  </p>
                </Section>

                <Section id="dataset" title="Dataset & class balance">
                  <p className="text-base leading-relaxed text-muted-foreground max-w-prose">
                    Source:{" "}
                    <span className="font-medium text-foreground">
                      {report.dataset.source}
                    </span>
                    . One row removed (gender = Other). BMI missing values are
                    imputed at inference; smoking &quot;Unknown&quot; is retained.
                  </p>
                  <FactsTable
                    rows={[
                      ["Raw rows", String(report.dataset.rows_raw)],
                      ["After cleaning", String(report.dataset.rows_clean)],
                      ["Features (raw input)", String(report.dataset.raw_input_features.length)],
                      [
                        "Stroke / no stroke",
                        `${report.dataset.stroke_positive} / ${report.dataset.stroke_negative}`,
                      ],
                      [
                        "Test set strokes",
                        String(report.dataset.test_stroke),
                      ],
                    ]}
                  />
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium text-foreground">
                            Field
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-foreground">
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["gender", "Demographic"],
                          ["age", "Primary risk factor"],
                          ["hypertension", "Comorbidity (0/1)"],
                          ["heart_disease", "Comorbidity (0/1)"],
                          ["ever_married", "Social / demographic"],
                          ["work_type", "Occupation category"],
                          ["Residence_type", "Urban vs rural"],
                          ["avg_glucose_level", "Numeric vital (mg/dL)"],
                          ["bmi", "Numeric (optional; KNN imputed if missing)"],
                          ["smoking_status", "Behavioral risk"],
                        ].map(([field, role]) => (
                          <tr
                            key={field}
                            className="border-b border-border last:border-0"
                          >
                            <td className="px-4 py-2 font-mono text-xs text-foreground">
                              {field}
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {role}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ClassBalanceChart data={report.charts.class_balance} />
                </Section>

                <Section id="pipeline" title="Pipeline & preprocessing">
                  <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-muted-foreground max-w-prose">
                    {report.pipeline.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <FactsTable
                    rows={[
                      ["Imputation", report.pipeline.imputation_method],
                      ["Resampling", report.pipeline.resampling_method],
                      ...Object.entries(report.pipeline.hyperparameters).map(
                        ([k, v]) => [k.replace("classifier__", ""), String(v)] as [
                          string,
                          string,
                        ],
                      ),
                    ]}
                  />
                  <div className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground max-w-prose">
                    <p className="font-medium text-foreground">
                      Why Random Forest shipped
                    </p>
                    <p className="mt-2">
                      Generalization gap (train − CV balanced accuracy): RF{" "}
                      <span className="tabular-nums font-medium text-foreground">
                        {report.pipeline.generalization_gaps.gap.random_forest.toFixed(
                          3,
                        )}
                      </span>{" "}
                      vs XGBoost{" "}
                      <span className="tabular-nums font-medium text-foreground">
                        {report.pipeline.generalization_gaps.gap.xgboost.toFixed(
                          3,
                        )}
                      </span>
                      . XGBoost overfit despite higher training scores; RF offered
                      stable CV performance and the lowest Brier score among finalists.
                    </p>
                  </div>
                </Section>

                <Section id="model-selection" title="Model comparison">
                  <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
                    Hold-out test metrics. Random Forest row is the deployed
                    artifact.
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          {[
                            "Model",
                            "Bal. acc.",
                            "Precision",
                            "Recall",
                            "F1",
                            "PR-AUC",
                            "Brier",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left font-medium text-foreground"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.models_comparison.map((row) => (
                          <tr
                            key={row.name}
                            className={cn(
                              "border-b border-border last:border-0",
                              row.is_best && "bg-primary/5",
                            )}
                          >
                            <td className="px-3 py-2 font-medium text-foreground">
                              {row.label}
                              {row.is_best && (
                                <span className="ml-2 text-xs font-normal text-brand">
                                  (deployed)
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-muted-foreground">
                              {formatPercent(row.balanced_accuracy)}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-muted-foreground">
                              {formatPercent(row.precision)}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-muted-foreground">
                              {formatPercent(row.recall)}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-muted-foreground">
                              {row.f1.toFixed(3)}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-muted-foreground">
                              {row.pr_auc.toFixed(3)}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-muted-foreground">
                              {row.brier_score.toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                <Section id="evaluation" title="Evaluation charts">
                  <div className="space-y-12">
                    <PrCurvesChart curves={report.charts.pr_curves} />
                    <CalibrationChart series={report.charts.calibration} />
                    <ConfusionMatrixChart matrix={report.charts.confusion_matrix} />
                  </div>
                </Section>

                <Section id="features" title="Feature importance">
                  <FeatureImportanceChart
                    features={report.charts.feature_importance}
                  />
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground max-w-prose">
                    <li>
                      Age and the engineered cardiovascular risk score carry the
                      most split weight after preprocessing.
                    </li>
                    <li>
                      Glucose and senior flag contribute; categorical BMI buckets
                      capture non-linear obesity effects.
                    </li>
                    <li>
                      One-hot encoded demographics add smaller but non-zero signal
                      — consistent with the notebook&apos;s Section 8 analysis.
                    </li>
                  </ul>
                </Section>

                <Section id="deployment" title="Deployment & risk tiers">
                  <FactsTable
                    rows={[
                      [
                        "High risk",
                        `≥ ${formatPercent(thresholds?.high_risk_min_probability ?? 0)} — ${report.deployment.actions.High}`,
                      ],
                      [
                        "Medium risk",
                        `≥ ${formatPercent(thresholds?.medium_risk_min_probability ?? 0)} — ${report.deployment.actions.Medium}`,
                      ],
                      [
                        "Low risk",
                        `< ${formatPercent(thresholds?.low_risk_max_probability ?? 0)} — ${report.deployment.actions.Low}`,
                      ],
                      ["Artifact", "artifacts/models/best_model.joblib"],
                      [
                        "Report generated",
                        new Date(report.deployment.created_at).toLocaleString(),
                      ],
                      [
                        "Random state",
                        String(report.deployment.random_state),
                      ],
                    ]}
                  />
                </Section>

                <Section id="sample-patients" title="Sample patients">
                  <SamplePatientsSection presets={report.presets} />
                </Section>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
