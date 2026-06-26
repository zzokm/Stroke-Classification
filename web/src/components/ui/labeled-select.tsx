"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOptionLabel, type SelectOption } from "@/lib/form-options";

interface LabeledSelectProps<T extends string> {
  id?: string;
  value: T | "";
  onValueChange: (value: T) => void;
  placeholder: string;
  options: readonly SelectOption<T>[];
  disabled?: boolean;
  size?: "sm" | "default";
  triggerClassName?: string;
}

export function LabeledSelect<T extends string>({
  id,
  value,
  onValueChange,
  placeholder,
  options,
  disabled,
  size = "default",
  triggerClassName,
}: LabeledSelectProps<T>) {
  return (
    <Select
      value={value || undefined}
      onValueChange={(next) => {
        if (next) onValueChange(next as T);
      }}
      disabled={disabled}
    >
      <SelectTrigger id={id} size={size} className={triggerClassName}>
        <SelectValue placeholder={placeholder}>
          {value ? getOptionLabel(options, value) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
