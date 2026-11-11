import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api";

/**
 * Puts server-side field errors (400 validation, 409 duplicate) onto the matching
 * form fields. Returns the message for anything that couldn't be placed on a field.
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, fields: readonly Path<T>[], setError: UseFormSetError<T>): string | null {
  if (!(error instanceof ApiError)) return "Can't reach the server. Check your connection and try again.";
  let placed = false;
  for (const d of error.details) {
    const field = fields.find((f) => f === d.path);
    if (field) {
      setError(field, { type: "server", message: d.path === "email" && error.status === 409 ? "This email is already in use" : d.message }, { shouldFocus: !placed });
      placed = true;
    }
  }
  return placed ? null : error.message;
}
