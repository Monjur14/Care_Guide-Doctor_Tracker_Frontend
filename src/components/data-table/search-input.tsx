"use client";

import { Search, X } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { cn } from "cn";

/**
 * Search box that reports changes after the user pauses typing, so the table
 * fires one request per search instead of one per keystroke.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  delay = 300,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);

  // Follow outside changes (e.g. "Clear filters" or back/forward navigation).
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  const commit = useEffectEvent((next: string) => onChange(next));
  useEffect(() => {
    if (draft.trim() === value.trim()) return;
    const t = setTimeout(() => commit(draft.trim()), delay);
    return () => clearTimeout(t);
  }, [draft, value, delay]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle-foreground" />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && draft) {
            e.preventDefault();
            setDraft("");
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
        className="h-8 w-full rounded-lg border border-input bg-transparent pr-8 pl-8 text-sm outline-none transition-colors placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={() => setDraft("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 grid size-5 -translate-y-1/2 place-items-center rounded text-subtle-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
