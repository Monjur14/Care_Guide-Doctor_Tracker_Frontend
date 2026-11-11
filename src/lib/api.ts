import type { ApiErrorBody } from "@doctor-tracker/shared";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: { path: string; message: string }[] = [],
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | undefined | null>;

function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return `/api/v1${path}${qs ? `?${qs}` : ""}`;
}

let onUnauthorized: (() => void) | undefined;
/** Registered once by the app shell: what to do when the session is gone. */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function request<T>(method: string, path: string, opts: { query?: Query; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(buildUrl(path, opts.query), {
    method,
    credentials: "same-origin",
    signal: opts.signal,
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const payload = (await res.json().catch(() => null)) as (ApiErrorBody & T) | null;
  if (!res.ok) {
    const err = payload?.error;
    if (res.status === 401 && !path.startsWith("/auth/login")) onUnauthorized?.();
    throw new ApiError(
      res.status,
      err?.code ?? "NETWORK_ERROR",
      err?.message ?? "Something went wrong. Please try again.",
      err?.details,
      err?.requestId,
    );
  }
  return payload as T;
}

export const api = {
  /** `signal` lets TanStack Query cancel a request the UI no longer needs (e.g. superseded searches). */
  get: <T>(path: string, query?: Query, opts: { signal?: AbortSignal } = {}) => request<T>("GET", path, { query, signal: opts.signal }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, { body }),
  delete: <T = void>(path: string) => request<T>("DELETE", path),
};
