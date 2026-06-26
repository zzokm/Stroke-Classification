import type { Metadata } from "next";
import { ModelDetailsPage } from "@/components/model-details/model-details-page";

export const metadata: Metadata = {
  title: "Model details · Stroke Risk Screening",
  description:
    "Dataset, pipeline, evaluation charts, and sample patients for the deployed stroke classifier.",
};

export default function Page() {
  return <ModelDetailsPage />;
}
