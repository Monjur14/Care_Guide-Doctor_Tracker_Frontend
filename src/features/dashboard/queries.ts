"use client";

import type { PatientsPerDoctorItem, StatsOverview, TimelinePoint } from "@doctor-tracker/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Range = "30d" | "12m";

const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export const statsKeys = {
  all: ["stats"] as const,
  overview: () => [...statsKeys.all, "overview"] as const,
  perDoctor: (limit: number) => [...statsKeys.all, "per-doctor", limit] as const,
  timeline: (range: Range) => [...statsKeys.all, "timeline", range, timeZone()] as const,
};

export function useOverview() {
  return useQuery({
    queryKey: statsKeys.overview(),
    queryFn: () => api.get<{ data: StatsOverview }>("/stats/overview").then((r) => r.data),
  });
}

export function usePatientsPerDoctor(limit = 8) {
  return useQuery({
    queryKey: statsKeys.perDoctor(limit),
    queryFn: () => api.get<{ data: PatientsPerDoctorItem[] }>("/stats/patients-per-doctor", { limit }).then((r) => r.data),
  });
}

/**
 * 30d: the same window as the "Admissions · 30 days" KPI (now − 30 days).
 * 12m: from the 1st of the month 11 months ago, so exactly 12 monthly buckets.
 */
function rangeBounds(range: Range) {
  const to = new Date();
  const from =
    range === "30d" ? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000) : new Date(to.getFullYear(), to.getMonth() - 11, 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function useTimeline(range: Range) {
  return useQuery({
    queryKey: statsKeys.timeline(range),
    queryFn: () =>
      api
        .get<{ data: TimelinePoint[] }>("/stats/timeline", {
          interval: range === "30d" ? "day" : "month",
          tz: timeZone(),
          ...rangeBounds(range),
        })
        .then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}
