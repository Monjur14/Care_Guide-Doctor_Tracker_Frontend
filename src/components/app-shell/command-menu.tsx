"use client";

import { Loader2, LogOut, Monitor, Moon, Search, Stethoscope, Sun, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useLogout } from "@/features/auth/queries";
import { useDoctors } from "@/features/doctors/queries";
import { usePatients } from "@/features/patients/queries";
import { STATUS_META } from "@/lib/status";
import { NAV_ITEMS } from "./nav";

/** Debounced search term; record lookups start at 2 characters. */
function useRecordSearch(term: string) {
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 200);
    return () => clearTimeout(t);
  }, [term]);
  const enabled = debounced.length >= 2;
  const base = { page: 1, limit: 5, search: debounced, order: "desc" as const };
  const doctors = useDoctors({ ...base, sort: "createdAt" }, { enabled });
  const patients = usePatients({ ...base, sort: "admissionDate" }, { enabled });
  return {
    enabled,
    // Ignore placeholder rows from a previous term so stale matches never show.
    doctors: enabled && !doctors.isPlaceholderData ? (doctors.data?.data ?? []) : [],
    patients: enabled && !patients.isPlaceholderData ? (patients.data?.data ?? []) : [],
    loading: enabled && (doctors.isFetching || patients.isFetching),
    settled: debounced === term.trim(),
  };
}

const matches = (text: string, term: string) => !term || text.toLowerCase().includes(term.trim().toLowerCase());

function Item({ value, onSelect, children }: { value: string; onSelect: () => void; children: ReactNode }) {
  return (
    <CommandItem value={value} onSelect={onSelect}>
      {children}
    </CommandItem>
  );
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const records = useRecordSearch(term);
  const router = useRouter();
  const { setTheme } = useTheme();
  const logout = useLogout();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    setTerm("");
    fn();
  };

  const nav = NAV_ITEMS.filter((n) => matches(`go to ${n.label}`, term));
  const themes = (["light", "dark", "system"] as const).filter((t) => matches(`theme ${t}`, term));
  const showLogout = matches("log out sign out", term);
  const nothing =
    nav.length + themes.length + (showLogout ? 1 : 0) + records.doctors.length + records.patients.length === 0 && !records.loading && records.settled;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="flex size-8 items-center justify-center gap-2 rounded-md text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:h-8 sm:w-full sm:max-w-64 sm:justify-start sm:border sm:border-input sm:bg-card sm:px-2.5 sm:hover:border-foreground/15 sm:hover:bg-card sm:hover:text-muted-foreground"
      >
        <Search className="size-4 sm:size-3.5" />
        <span className="hidden flex-1 text-left text-sm sm:inline">Search…</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline">
          Ctrl K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setTerm("");
        }}
        title="Command menu"
        description="Search records, jump to a page or run a command"
        className="rounded-[12px]! shadow-overlay sm:max-w-lg"
      >
        {/* Filtering is done here: records come from the server, static items by substring. */}
        <Command shouldFilter={false}>
          <CommandInput value={term} onValueChange={setTerm} placeholder="Search doctors, patients or commands…" />
          <CommandList>
            {nothing && <div className="py-6 text-center text-sm text-muted-foreground">No results.</div>}
            {records.loading && records.doctors.length + records.patients.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-4 text-[13px] text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Searching…
              </div>
            )}
            {records.doctors.length > 0 && (
              <CommandGroup heading="Doctors">
                {records.doctors.map((d) => (
                  <Item key={d.id} value={`doctor-${d.id}`} onSelect={() => run(() => router.push(`/doctors/${d.id}`))}>
                    <Stethoscope />
                    <span className="truncate">{d.name}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">{d.specialization}</span>
                  </Item>
                ))}
              </CommandGroup>
            )}
            {records.patients.length > 0 && (
              <CommandGroup heading="Patients">
                {records.patients.map((p) => (
                  <Item
                    key={p.id}
                    value={`patient-${p.id}`}
                    onSelect={() => run(() => router.push(`/patients?q=${encodeURIComponent(p.name)}`))}
                  >
                    <UserRound />
                    <span className="truncate">{p.name}</span>
                    <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-1.5 rounded-full" style={{ background: STATUS_META[p.status].colorVar }} aria-hidden="true" />
                      {p.condition}
                    </span>
                  </Item>
                ))}
              </CommandGroup>
            )}
            {nav.length > 0 && (
              <CommandGroup heading="Go to">
                {nav.map(({ href, label, icon: Icon }) => (
                  <Item key={href} value={`go ${label}`} onSelect={() => run(() => router.push(href))}>
                    <Icon /> {label}
                  </Item>
                ))}
              </CommandGroup>
            )}
            {themes.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Theme">
                  {themes.includes("light") && (
                    <Item value="theme light" onSelect={() => run(() => setTheme("light"))}>
                      <Sun /> Light
                    </Item>
                  )}
                  {themes.includes("dark") && (
                    <Item value="theme dark" onSelect={() => run(() => setTheme("dark"))}>
                      <Moon /> Dark
                    </Item>
                  )}
                  {themes.includes("system") && (
                    <Item value="theme system" onSelect={() => run(() => setTheme("system"))}>
                      <Monitor /> System
                    </Item>
                  )}
                </CommandGroup>
              </>
            )}
            {showLogout && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Account">
                  <Item value="log out" onSelect={() => run(() => logout.mutate())}>
                    <LogOut /> Log out
                  </Item>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
