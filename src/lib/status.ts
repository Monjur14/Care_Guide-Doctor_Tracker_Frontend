import type { PatientStatus } from "@doctor-tracker/shared";

export const STATUS_META: Record<PatientStatus, { label: string; colorVar: string }> = {
  admitted: { label: "Admitted", colorVar: "var(--status-admitted)" },
  under_treatment: { label: "Under treatment", colorVar: "var(--status-under-treatment)" },
  discharged: { label: "Discharged", colorVar: "var(--status-discharged)" },
};
