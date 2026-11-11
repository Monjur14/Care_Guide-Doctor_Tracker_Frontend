import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";

export interface BarListItem {
  key: string;
  label: ReactNode;
  sublabel?: ReactNode;
  value: number;
}

/** Ranked horizontal bars. Plain CSS: crisp, accessible, no chart runtime. */
export function BarList({ items, max }: { items: BarListItem[]; max?: number }) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="grid gap-1">
      {items.map((item) => (
        <li key={item.key} className="group relative flex h-9 items-center gap-3 rounded-md px-2.5">
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-0 rounded-[5px] bg-primary/10 transition-[width] duration-500 ease-out-quint group-hover:bg-primary/16"
            style={{ width: `${Math.max(2, (item.value / top) * 100)}%` }}
          />
          <span className="relative min-w-0 flex-1 truncate text-sm">
            {item.label}
            {item.sublabel && <span className="ml-2 text-xs text-subtle-foreground">{item.sublabel}</span>}
          </span>
          <span className="tabular relative text-sm font-medium">{formatNumber(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export function BarListSkeleton({ rows }: { rows: number }) {
  return (
    <ul className="grid gap-1" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="h-9 px-0 py-1">
          <div className="h-full animate-pulse rounded-[5px] bg-muted" style={{ width: `${92 - i * 9}%` }} />
        </li>
      ))}
    </ul>
  );
}
