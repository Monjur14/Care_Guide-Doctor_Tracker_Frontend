"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Panel } from "@/components/panel";
import { ErrorState } from "@/components/feedback/error-state";
import { formatNumber } from "@/lib/format";
import { useOverview } from "./queries";

interface Kpi {
  label: string;
  value: number;
  note: string;
  accent?: boolean;
}

export function KpiStrip() {
  const { data, isPending, error, refetch } = useOverview();

  if (error) {
    return (
      <Panel>
        <ErrorState error={error} onRetry={() => refetch()} compact />
      </Panel>
    );
  }

  const kpis: Kpi[] | null = data
    ? [
        { label: "Doctors", value: data.totalDoctors, note: `${formatNumber(data.newDoctorsLast30Days)} added in the last 30 days` },
        { label: "Patients", value: data.totalPatients, note: `${formatNumber(data.patientsByStatus.discharged)} discharged` },
        {
          label: "Admissions · 30 days",
          value: data.admissionsLast30Days,
          note: `≈ ${formatNumber(Math.round(data.admissionsLast30Days / 30))} per day`,
        },
        {
          label: "Currently admitted",
          value: data.patientsByStatus.admitted,
          note: `${formatNumber(data.patientsByStatus.under_treatment)} under treatment`,
          accent: true,
        },
      ]
    : null;

  return (
    <Panel aria-label="Key figures" aria-busy={isPending}>
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {(kpis ?? Array.from({ length: 4 }, () => null)).map((kpi, i) => (
          <div
            key={kpi?.label ?? i}
            className="border-border px-5 py-4 max-lg:[&:nth-child(-n+2)]:border-b [&:not(:first-child)]:border-l max-lg:[&:nth-child(3)]:border-l-0"
          >
            {kpi ? (
              <>
                <dt className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  {kpi.accent && <span className="size-1.5 rounded-full bg-status-admitted" aria-hidden="true" />}
                  {kpi.label}
                </dt>
                <dd className="tabular mt-1.5 text-[28px] font-semibold leading-none tracking-[-0.02em] md:text-[32px]">
                  {formatNumber(kpi.value)}
                </dd>
                <dd className="mt-2 text-xs leading-snug text-subtle-foreground">{kpi.note}</dd>
              </>
            ) : (
              <>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-2.5 h-8 w-16" />
                <Skeleton className="mt-2.5 h-3 w-28" />
              </>
            )}
          </div>
        ))}
      </dl>
    </Panel>
  );
}
