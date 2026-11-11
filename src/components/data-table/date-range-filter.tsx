"use client";

import { CalendarDays, X } from "lucide-react";
import { useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate, todayInput } from "@/lib/format";

export interface DayRange {
  from: string | null;
  to: string | null;
}

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 12 months", days: 365 },
] as const;

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function summary({ from, to }: DayRange) {
  const f = (s: string) => formatDate(`${s}T00:00:00.000Z`);
  if (from && to) return `${f(from)} – ${f(to)}`;
  if (from) return `From ${f(from)}`;
  if (to) return `Until ${f(to)}`;
  return null;
}

/** Date-wise filter: quick presets plus a custom from/to range. */
export function DateRangeFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: DayRange;
  onChange: (value: DayRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DayRange>(value);
  const active = summary(value);
  const today = todayInput();
  const invalid = !!(draft.from && draft.to && draft.from > draft.to);

  const apply = (range: DayRange) => {
    onChange(range);
    setOpen(false);
  };

  return (
    <div className="flex items-center">
      <Popover
        open={open}
        onOpenChange={(o) => {
          if (o) setDraft(value);
          setOpen(o);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-8 bg-card font-normal text-muted-foreground dark:bg-input/30",
              active && "rounded-r-none border-r-0 border-primary/40 text-foreground",
            )}
          >
            <CalendarDays className="text-subtle-foreground" />
            {active ?? label}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 gap-3 p-3">
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((p) => (
              <Button key={p.days} variant="outline" size="sm" className="justify-start font-normal" onClick={() => apply({ from: daysAgo(p.days), to: today })}>
                {p.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
            <div className="grid gap-1.5">
              <Label htmlFor="range-from" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input id="range-from" type="date" max={today} value={draft.from ?? ""} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value || null }))} className="h-8 text-xs" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="range-to" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input id="range-to" type="date" max={today} value={draft.to ?? ""} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value || null }))} className="h-8 text-xs" />
            </div>
          </div>
          {invalid && <p className="text-xs text-destructive">&quot;From&quot; must be on or before &quot;To&quot;.</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => apply({ from: null, to: null })}>
              Reset
            </Button>
            <Button size="sm" disabled={invalid} onClick={() => apply(draft)}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {active && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-7 rounded-l-none border-primary/40 bg-card text-subtle-foreground dark:bg-input/30"
          onClick={() => onChange({ from: null, to: null })}
          aria-label={`Clear ${label.toLowerCase()} filter`}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
