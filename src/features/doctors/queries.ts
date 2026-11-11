"use client";

import type { ApiList, Doctor, DoctorCreateInput, DoctorUpdateInput, Specialization } from "@doctor-tracker/shared";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DoctorListParams {
  page: number;
  limit: number;
  search?: string;
  specialization?: Specialization;
  hospital?: string;
  sort: "createdAt" | "name";
  order: "asc" | "desc";
  from?: string;
  to?: string;
}

export const doctorKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (params: DoctorListParams) => [...doctorKeys.lists(), params] as const,
  detail: (id: string) => [...doctorKeys.all, "detail", id] as const,
};

export function useDoctors(params: DoctorListParams, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: doctorKeys.list(params),
    queryFn: ({ signal }) => api.get<ApiList<Doctor>>("/doctors", { ...params }, { signal }),
    // Keep the current page on screen while the next one loads (no table flash).
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

export function useDoctor(id: string, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => api.get<{ data: Doctor }>(`/doctors/${id}`).then((r) => r.data),
    enabled: opts.enabled,
  });
}

/** Doctor writes change lists, counts, hospital options and dashboard stats. */
function useInvalidateDoctorData() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: doctorKeys.all }),
      qc.invalidateQueries({ queryKey: ["meta"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      // Patient rows embed the doctor's name/specialization.
      qc.invalidateQueries({ queryKey: ["patients"] }),
    ]);
}

export function useCreateDoctor() {
  const invalidate = useInvalidateDoctorData();
  return useMutation({
    mutationFn: (input: DoctorCreateInput) => api.post<{ data: Doctor }>("/doctors", input).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useUpdateDoctor(id: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidateDoctorData();
  return useMutation({
    mutationFn: (input: DoctorUpdateInput) => api.patch<{ data: Doctor }>(`/doctors/${id}`, input).then((r) => r.data),
    onSuccess: (doctor) => {
      qc.setQueryData(doctorKeys.detail(id), doctor);
      return invalidate();
    },
  });
}
