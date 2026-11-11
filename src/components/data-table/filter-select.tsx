"use client";

import { cn } from "cn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "__all__";

export interface FilterOption {
  value: string;
  label: string;
}

/** A compact select with an "All …" choice that maps to `null` (filter off). */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string | null;
  options: readonly FilterOption[];
  onChange: (value: string | null) => void;
  className?: string;
}) {
  return (
    <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? null : v)}>
      <SelectTrigger
        aria-label={label}
        className={cn("h-8 min-w-36 bg-card dark:bg-input/30", value && "border-primary/40 text-foreground", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start" className="max-h-72">
        <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Builds options from a list of strings shown as-is. */
export const toOptions = (values: readonly string[]): FilterOption[] => values.map((v) => ({ value: v, label: v }));
