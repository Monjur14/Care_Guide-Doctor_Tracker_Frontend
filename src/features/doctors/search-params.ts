import { SPECIALIZATIONS } from "@doctor-tracker/shared";
import { parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";
import { PAGE_SIZES } from "@/components/data-table/pagination-bar";

/** Doctors list state lives in the URL, so filters survive reloads and can be shared. */
export const doctorSearchParams = {
  q: parseAsString.withDefault(""),
  specialization: parseAsStringLiteral(SPECIALIZATIONS),
  hospital: parseAsString,
  from: parseAsString,
  to: parseAsString,
  sort: parseAsStringLiteral(["createdAt", "name"] as const).withDefault("createdAt"),
  order: parseAsStringLiteral(["asc", "desc"] as const).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsStringLiteral(PAGE_SIZES.map(String) as ["10", "20", "50"]).withDefault("10"),
};
