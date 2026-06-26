import type { PatientPayload, PredictionResult } from "./types";
import type { ModelReport } from "./model-report";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8003"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function predictStrokeRisk(
  payload: PatientPayload,
): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = "We couldn't complete the screening. Please try again.";
    try {
      const body = (await response.json()) as { detail?: string | unknown };
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      /* use default message */
    }
    throw new ApiError(detail, response.status);
  }

  return response.json() as Promise<PredictionResult>;
}

export async function fetchModelReport(): Promise<ModelReport> {
  const response = await fetch(`${API_BASE}/model/report`, {
    cache: "no-store",
  });

  if (!response.ok) {
    let detail =
      "Model report is unavailable. Run python scripts/export_model_report.py and restart the API.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      /* use default */
    }
    throw new ApiError(detail, response.status);
  }

  return response.json() as Promise<ModelReport>;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
