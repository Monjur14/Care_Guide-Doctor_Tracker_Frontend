import type { PatientStatus } from "@doctor-tracker/shared";
import { cn } from "cn";
import { STATUS_META } from "@/lib/status";

/** Status as a tinted pill: the color sits in the dot and a faint wash, never in the text. */
export function StatusPill({ status, className }: { status: PatientStatus; className?: string }) {
  const { label, colorVar } = STATUS_META[status];
  return (
    <span
      className={cn("inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap", className)}
      style={{ background: `color-mix(in oklch, ${colorVar} 13%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: colorVar }} aria-hidden="true" />
      {label}
    </span>
  );
}
