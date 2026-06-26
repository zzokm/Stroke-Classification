"use client";

import { FIELD_HELP, type FieldHelpKey } from "@/lib/field-help";
import { FieldInfoTooltip } from "@/components/ui/field-info-tooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  helpKey: FieldHelpKey;
  className?: string;
}

export function FieldLabel({
  htmlFor,
  children,
  helpKey,
  className,
}: FieldLabelProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{children}</Label>
      <FieldInfoTooltip help={FIELD_HELP[helpKey]} />
    </div>
  );
}
