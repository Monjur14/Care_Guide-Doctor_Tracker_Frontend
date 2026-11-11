"use client";

import type { AuthUser, LoginInput } from "@doctor-tracker/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export const authKeys = { me: ["auth", "me"] as const };

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<{ data: AuthUser }>("/auth/me").then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<{ data: AuthUser }>("/auth/login", input).then((r) => r.data),
    onSuccess: (user) => {
      qc.clear();
      qc.setQueryData(authKeys.me, user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSettled: () => {
      qc.clear();
      router.replace("/login");
    },
  });
}
