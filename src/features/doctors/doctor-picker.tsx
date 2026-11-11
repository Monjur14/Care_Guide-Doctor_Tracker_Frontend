"use client";

import type { DoctorSummary } from "@doctor-tracker/shared";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDoctors } from "./queries";

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/**
 * Searchable doctor combobox. Searches on the server (20 at a time), so it
 * stays fast no matter how many doctors exist.
 */
export const DoctorPicker = forwardRef<
  HTMLButtonElement,
  {
    value: DoctorSummary | null;
    onChange: (doctor: DoctorSummary | null) => void;
    placeholder?: string;
    /** Filter mode: compact trigger with a clear button. */
    variant?: "field" | "filter";
    id?: string;
    invalid?: boolean;
    describedBy?: string;
  }
>(function DoctorPicker({ value, onChange, placeholder = "Select doctor", variant = "field", id, invalid, describedBy }, ref) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search);
  const { data, isFetching } = useDoctors({ page: 1, limit: 20, search: debounced || undefined, sort: "name", order: "asc" }, { enabled: open });
  const isFilter = variant === "filter";

  return (
    <div className="flex items-center">
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={cn(
              "justify-between bg-card font-normal dark:bg-input/30",
              isFilter ? "h-8 min-w-36" : "h-9 w-full",
              !value && "text-muted-foreground",
              isFilter && value && "rounded-r-none border-r-0 border-primary/40 text-foreground",
              invalid && "border-destructive",
            )}
          >
            <span className="truncate">{value ? value.name : isFilter ? "All doctors" : placeholder}</span>
            <ChevronsUpDown className="text-subtle-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 p-0">
          <Command shouldFilter={false}>
            <CommandInput value={search} onValueChange={setSearch} placeholder="Search doctors…" />
            <CommandList>
              {isFetching && !data ? (
                <div className="grid place-items-center py-6">
                  <Loader2 className="size-4 animate-spin text-subtle-foreground" />
                </div>
              ) : (
                <CommandEmpty>No doctors found.</CommandEmpty>
              )}
              {data && data.data.length > 0 && (
                <CommandGroup>
                  {data.data.map((d) => (
                    <CommandItem
                      key={d.id}
                      value={d.id}
                      onSelect={() => {
                        onChange({ id: d.id, name: d.name, specialization: d.specialization });
                        setOpen(false);
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{d.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{d.specialization}</p>
                      </div>
                      <Check className={cn("ml-auto", value?.id === d.id ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isFilter && value && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-7 rounded-l-none border-primary/40 bg-card text-subtle-foreground dark:bg-input/30"
          onClick={() => onChange(null)}
          aria-label="Clear doctor filter"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
});
