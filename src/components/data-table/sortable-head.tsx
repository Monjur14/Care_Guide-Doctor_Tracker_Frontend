"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "cn";
import { TableHead } from "@/components/ui/table";

export type SortOrder = "asc" | "desc";

/** Column header that sorts by `field`; clicking the active column flips the order. */
export function SortableHead<F extends string>({
  field,
  sort,
  order,
  onSort,
  children,
  className,
}: {
  field: F;
  sort: F;
  order: SortOrder;
  onSort: (field: F, order: SortOrder) => void;
  children: ReactNode;
  className?: string;
}) {
  const active = sort === field;
  const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={className} aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(field, active && order === "desc" ? "asc" : active ? "desc" : field === "name" ? "asc" : "desc")}
        className={cn(
          "-ml-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          active && "text-foreground",
        )}
      >
        {children}
        <Icon className={cn("size-3", active ? "text-foreground" : "text-subtle-foreground/70")} />
      </button>
    </TableHead>
  );
}
