"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { Panel, PanelHeader } from "@/components/panel";
import { BarList, BarListSkeleton } from "./bar-list";
import { usePatientsPerDoctor } from "./queries";

const LIMIT = 8;

export function TopDoctors() {
  const { data, isPending, error, refetch } = usePatientsPerDoctor(LIMIT);
  return (
    <Panel>
      <PanelHeader title="Patients per doctor" description={`Top ${LIMIT} by number of patients`} />
      <div className="px-3 pb-4 pt-3">
        {error ? (
          <ErrorState error={error} onRetry={() => refetch()} compact />
        ) : isPending ? (
          <BarListSkeleton rows={LIMIT} />
        ) : data.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">No patients yet.</p>
        ) : (
          <BarList
            items={data.map((d) => ({
              key: d.doctor.id,
              label: d.doctor.name,
              sublabel: d.doctor.specialization,
              value: d.count,
            }))}
          />
        )}
      </div>
    </Panel>
  );
}
