"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/** Right-hand drawer that hosts a create/edit form with a pinned footer. */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  formId,
  submitLabel,
  pending,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  formId: string;
  submitLabel: string;
  pending: boolean;
  /** Rendered only while open, so the form inside starts fresh every time. */
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
          {description && <SheetDescription className="text-[13px]">{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={pending} className="min-w-24">
            {pending && <Loader2 className="animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-5 rounded-md border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
      {message}
    </div>
  );
}
