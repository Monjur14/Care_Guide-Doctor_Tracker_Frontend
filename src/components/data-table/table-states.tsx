import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function SkeletonRows({ rows, columns }: { rows: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <TableRow key={r} className="hover:bg-transparent" aria-hidden="true">
          {Array.from({ length: columns }, (_, c) => (
            <TableCell key={c} className="h-[52px]">
              <Skeleton className="h-3.5" style={{ width: c === 0 ? "70%" : `${45 + ((r * 7 + c * 13) % 40)}%` }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function EmptyRow({ columns, title, description, action }: { columns: number; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columns} className="h-56 text-center whitespace-normal">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </TableCell>
    </TableRow>
  );
}
