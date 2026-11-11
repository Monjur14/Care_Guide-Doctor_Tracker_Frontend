"use client";

import type { FilterOptions } from "@doctor-tracker/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const metaKeys = { filters: ["meta", "filters"] as const };

/** Dropdown options (enums + distinct hospitals). Rarely changes, so cache it for 5 minutes. */
export function useFilterOptions() {
  return useQuery({
    queryKey: metaKeys.filters,
    queryFn: () => api.get<{ data: FilterOptions }>("/meta/filters").then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}
