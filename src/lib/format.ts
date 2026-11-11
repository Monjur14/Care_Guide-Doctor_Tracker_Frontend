const integer = new Intl.NumberFormat("en-US");
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

export const formatNumber = (n: number) => integer.format(n);
export const formatPercent = (ratio: number) => percent.format(Number.isFinite(ratio) ? ratio : 0);

const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

/** Formats a timeline bucket key ("2026-11-03" or "2026-11") for chart axes. */
export function formatBucket(bucket: string) {
  const [y, m, d] = bucket.split("-").map(Number);
  const date = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  return d ? dayLabel.format(date) : monthLabel.format(date);
}

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/*
 * Dates are shown and edited as calendar days in UTC. A date picked in a form
 * ("2026-11-03") is stored as UTC midnight, so formatting in UTC shows the
 * same day back in every time zone.
 */
const dateLabel = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export const formatDate = (iso: string) => dateLabel.format(new Date(iso));

/** ISO string → "YYYY-MM-DD" for <input type="date">. */
export const toDateInput = (iso: string) => new Date(iso).toISOString().slice(0, 10);

/** Today's calendar date in the user's time zone, as "YYYY-MM-DD". */
export function todayInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A day-range from the URL → inclusive API bounds (start of `from`, end of `to`). */
export function dayRangeQuery(from: string | null, to: string | null) {
  return {
    from: from && DAY_RE.test(from) ? `${from}T00:00:00.000Z` : undefined,
    to: to && DAY_RE.test(to) ? `${to}T23:59:59.999Z` : undefined,
  };
}
