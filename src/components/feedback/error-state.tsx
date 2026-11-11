"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

export function ErrorState({ error, onRetry, compact = false }: { error: unknown; onRetry?: () => void; compact?: boolean }) {
  const message = error instanceof ApiError ? error.message : "Something went wrong while loading this data.";
  const requestId = error instanceof ApiError ? error.requestId : undefined;
  return (
    <div role="alert" className={compact ? "grid place-items-center gap-3 px-5 py-8 text-center" : "grid place-items-center gap-3 px-5 py-16 text-center"}>
      <div>
        <p className="text-sm font-medium">Couldn&apos;t load this</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{message}</p>
        {requestId && <p className="mt-1 font-mono text-[11px] text-subtle-foreground">Ref {requestId.slice(0, 8)}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  );
}
