"use client";

import { PATIENT_STATUSES } from "@doctor-tracker/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { Panel, PanelHeader } from "@/components/panel";
import { formatNumber, formatPercent } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import { useOverview } from "./queries";

export function StatusBreakdown() {
  const { data, isPending, error, refetch } = useOverview();
  const total = data?.totalPatients ?? 0;

  return (
    <Panel className="flex flex-col">
      <PanelHeader title="Patient status" description="Share of all patients" />
      <div className="flex flex-1 flex-col gap-6 px-5 pb-5 pt-6">
        {error ? (
          <ErrorState error={error} onRetry={() => refetch()} compact />
        ) : isPending ? (
          <>
            <Skeleton className="h-2 w-full" />
            <div className="grid gap-4">
              {PATIENT_STATUSES.map((s) => (
                <Skeleton key={s} className="h-5 w-full" />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Patient status distribution">
              {PATIENT_STATUSES.map((s) => (
                <div
                  key={s}
                  className="h-full transition-[flex-grow] duration-500 ease-out-quint first:rounded-l-full last:rounded-r-full"
                  style={{ flexGrow: data.patientsByStatus[s], background: STATUS_META[s].colorVar }}
                />
              ))}
            </div>
            <ul className="grid gap-3.5">
              {PATIENT_STATUSES.map((s) => {
                const count = data.patientsByStatus[s];
                return (
                  <li key={s} className="flex items-center gap-2.5 text-sm">
                    <span className="size-2 rounded-full" style={{ background: STATUS_META[s].colorVar }} aria-hidden="true" />
                    <span className="flex-1 text-muted-foreground">{STATUS_META[s].label}</span>
                    <span className="tabular font-medium">{formatNumber(count)}</span>
                    <span className="tabular w-10 text-right text-xs text-subtle-foreground">{formatPercent(count / total)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="tabular mt-auto flex justify-between border-t border-border pt-3.5 text-sm text-muted-foreground">
              Total patients <span className="font-medium text-foreground">{formatNumber(total)}</span>
            </p>
          </>
        )}
      </div>
    </Panel>
  );
}
