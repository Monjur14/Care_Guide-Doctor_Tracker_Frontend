import { Suspense } from "react";
import { AdmissionsChart } from "./admissions-chart";
import { Conditions } from "./conditions";
import { KpiStrip } from "./kpi-strip";
import { StatusBreakdown } from "./status-breakdown";
import { TopDoctors } from "./top-doctors";

/** The dashboard grid. Shared by the dashboard page and the sign-in page preview. */
export function DashboardContent() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <KpiStrip />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Suspense>
            <AdmissionsChart />
          </Suspense>
        </div>
        <StatusBreakdown />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopDoctors />
        <Conditions />
      </div>
    </div>
  );
}
