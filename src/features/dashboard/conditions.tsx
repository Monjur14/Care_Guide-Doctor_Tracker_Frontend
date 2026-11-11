"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { Panel, PanelHeader } from "@/components/panel";
import { BarList, BarListSkeleton } from "./bar-list";
import { useOverview } from "./queries";

export function Conditions() {
  const { data, isPending, error, refetch } = useOverview();
  const rows = data?.patientsByCondition.slice(0, 8) ?? [];
  const others = data?.patientsByCondition.slice(8).reduce((s, c) => s + c.count, 0) ?? 0;
  return (
    <Panel>
      <PanelHeader title="Patients by condition" description="Most common first" />
      <div className="px-3 pb-4 pt-3">
        {error ? (
          <ErrorState error={error} onRetry={() => refetch()} compact />
        ) : isPending ? (
          <BarListSkeleton rows={8} />
        ) : rows.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">No patients yet.</p>
        ) : (
          <>
            <BarList items={rows.map((c) => ({ key: c.condition, label: c.condition, value: c.count }))} />
            {others > 0 && (
              <p className="tabular mt-2 px-2.5 text-xs text-subtle-foreground">
                + {data!.patientsByCondition.length - 8} more conditions · {others} patients
              </p>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}
