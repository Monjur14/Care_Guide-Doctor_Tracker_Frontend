import { CONDITIONS, GENDERS, PATIENT_STATUSES } from "@doctor-tracker/shared";
import { parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";

/** Patients list state lives in the URL, so filters survive reloads and can be shared. */
export const patientSearchParams = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(PATIENT_STATUSES),
  condition: parseAsStringLiteral(CONDITIONS),
  gender: parseAsStringLiteral(GENDERS),
  doctor: parseAsString,
  from: parseAsString,
  to: parseAsString,
  sort: parseAsStringLiteral(["admissionDate", "createdAt", "name", "age"] as const).withDefault("admissionDate"),
  order: parseAsStringLiteral(["asc", "desc"] as const).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsStringLiteral(["10", "20", "50"] as const).withDefault("10"),
};
