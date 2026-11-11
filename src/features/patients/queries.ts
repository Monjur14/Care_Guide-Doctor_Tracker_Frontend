"use client";

import type { ApiList, Condition, Gender, Patient, PatientCreateInput, PatientStatus, PatientUpdateInput } from "@doctor-tracker/shared";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type PatientSort = "admissionDate" | "createdAt" | "name" | "age";

export interface PatientListParams {
  page: number;
  limit: number;
  search?: string;
  status?: PatientStatus;
  condition?: Condition;
  gender?: Gender;
  doctorId?: string;
  sort: PatientSort;
  order: "asc" | "desc";
  from?: string;
  to?: string;
}

export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (params: PatientListParams) => [...patientKeys.lists(), params] as const,
};

export function usePatients(params: PatientListParams, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: ({ signal }) => {
      const { doctorId, ...query } = params;
      // A doctor's own list uses the nested resource; the global list filters by doctorId.
      return doctorId
        ? api.get<ApiList<Patient>>(`/doctors/${doctorId}/patients`, query, { signal })
        : api.get<ApiList<Patient>>("/patients", query, { signal });
    },
    placeholderData: keepPreviousData,
    enabled: opts.enabled,
  });
}

/** Patient writes change patient lists, doctors' patient counts and dashboard stats. */
function useInvalidatePatientData() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: patientKeys.all }),
      qc.invalidateQueries({ queryKey: ["doctors"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
    ]);
}

export function useCreatePatient() {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: ({ doctorId, input }: { doctorId: string; input: PatientCreateInput }) =>
      api.post<{ data: Patient }>(`/doctors/${doctorId}/patients`, input).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useUpdatePatient() {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatientUpdateInput }) =>
      api.patch<{ data: Patient }>(`/patients/${id}`, input).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/patients/${id}`),
    onSuccess: invalidate,
  });
}
