"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { TimelinePoint } from "@doctor-tracker/shared";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ErrorState } from "@/components/feedback/error-state";
import { Panel, PanelHeader } from "@/components/panel";
import { formatBucket, formatNumber } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import { useTimeline, type Range } from "./queries";

const RANGES = ["30d", "12m"] as const;
const chartConfig = { total: { label: "Admissions", color: "var(--chart-1)" } } satisfies ChartConfig;

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.[0]?.payload as TimelinePoint | undefined;
  if (!active || !point) return null;
  return (
    <div className="min-w-44 rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-overlay">
      <p className="font-medium">{formatBucket(point.bucket)}</p>
      <p className="tabular mt-1 flex justify-between gap-4 text-muted-foreground">
        Admissions <span className="font-medium text-foreground">{formatNumber(point.total)}</span>
      </p>
      <div className="mt-1.5 grid gap-1 border-t border-border pt-1.5">
        {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((s) => (
          <p key={s} className="tabular flex items-center justify-between gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" style={{ background: STATUS_META[s].colorVar }} />
              {STATUS_META[s].label}
            </span>
            <span className="text-foreground">{formatNumber(point[s])}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function AdmissionsChart() {
  const [range, setRange] = useQueryState("range", parseAsStringLiteral(RANGES).withDefault("30d"));
  const { data, isPending, isFetching, error, refetch } = useTimeline(range as Range);
  const total = data?.reduce((sum, p) => sum + p.total, 0) ?? 0;

  return (
    <Panel className="flex flex-col">
      <PanelHeader
        title="Admissions"
        description={
          data ? (
            <span className="tabular">
              {formatNumber(total)} in the last {range === "30d" ? "30 days" : "12 months"}
            </span>
          ) : (
            "By admission date, in your time zone"
          )
        }
        actions={
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={range}
            onValueChange={(v) => v && setRange(v as Range)}
            aria-label="Time range"
          >
            <ToggleGroupItem value="30d" className="px-2.5 text-xs">
              30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="12m" className="px-2.5 text-xs">
              12 months
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <div className="relative flex-1 px-2 pb-3 pt-4">
        {error ? (
          <ErrorState error={error} onRetry={() => refetch()} compact />
        ) : isPending ? (
          <Skeleton className="mx-3 h-[240px]" />
        ) : (
          <ChartContainer config={chartConfig} className={`h-[240px] w-full transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="admissions-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-total)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--color-total)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="bucket"
                tickFormatter={formatBucket}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tick={{ fill: "var(--subtle-foreground)", fontSize: 11 }}
              />
              <YAxis
                width={32}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--subtle-foreground)", fontSize: 11 }}
              />
              <Tooltip content={ChartTooltip} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
              <Area
                dataKey="total"
                type="monotone"
                stroke="var(--color-total)"
                strokeWidth={1.75}
                fill="url(#admissions-fill)"
                activeDot={{ r: 3.5, strokeWidth: 0 }}
                animationDuration={450}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </Panel>
  );
}
