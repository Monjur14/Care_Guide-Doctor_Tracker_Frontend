"use client";

import type { PaginationMeta } from "@doctor-tracker/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/format";

export const PAGE_SIZES = [10, 20, 50] as const;

/** Page numbers to show: first, last, and a window around the current page, with gaps as null. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push(null);
    out.push(p);
  });
  return out;
}

export function PaginationBar({
  meta,
  onPageChange,
  onLimitChange,
  noun = "results",
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  noun?: string;
}) {
  const { page, limit, total, totalPages } = meta;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
      <p className="tabular">
        {total === 0 ? (
          `No ${noun}`
        ) : (
          <>
            <span className="text-foreground">
              {formatNumber(start)}–{formatNumber(end)}
            </span>{" "}
            of {formatNumber(total)} {noun}
          </>
        )}
      </p>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <span>Rows</span>
          <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
            <SelectTrigger size="sm" aria-label="Rows per page" className="tabular">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <span className="tabular px-1 sm:hidden">
            {page} / {Math.max(1, totalPages)}
          </span>
          <div className="hidden items-center gap-1 sm:flex">
            {pageWindow(page, totalPages).map((p, i) =>
              p === null ? (
                <span key={`gap-${i}`} className="px-1 text-subtle-foreground" aria-hidden="true">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "outline" : "ghost"}
                  size="icon-sm"
                  className="tabular w-auto min-w-7 px-1.5 text-[13px]"
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Page ${p}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </Button>
              ),
            )}
          </div>
          <Button variant="ghost" size="icon-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
            <ChevronRight />
          </Button>
        </nav>
      </div>
    </div>
  );
}
