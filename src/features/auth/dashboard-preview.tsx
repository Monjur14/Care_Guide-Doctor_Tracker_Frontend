"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayoutGrid, Search, Stethoscope, UsersRound } from "lucide-react";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "cn";
import { Logo } from "@/components/brand/logo";
import { DashboardContent } from "@/features/dashboard/dashboard-content";
import { statsKeys } from "@/features/dashboard/queries";
import { PREVIEW_OVERVIEW, PREVIEW_PER_DOCTOR, PREVIEW_TIMELINE } from "./preview-data";

/** The preview is laid out at this width, then scaled to fit the panel. */
const DESIGN_WIDTH = 1180;
/** Below this the text gets too small to read; the frame runs off the edge instead. */
const MIN_SCALE = 0.62;
/** Approximate laid-out height at DESIGN_WIDTH, used to reserve space before measuring. */
const DESIGN_HEIGHT = 1083;

/**
 * A private query cache pre-filled with sample data, so the real dashboard
 * components render without a session and never hit the network.
 */
function makePreviewClient() {
  const qc = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity, retry: false, refetchOnMount: false, refetchOnWindowFocus: false } },
  });
  qc.setQueryData(statsKeys.overview(), PREVIEW_OVERVIEW);
  qc.setQueryData(statsKeys.perDoctor(8), PREVIEW_PER_DOCTOR);
  qc.setQueryData(statsKeys.timeline("30d"), PREVIEW_TIMELINE["30d"]);
  qc.setQueryData(statsKeys.timeline("12m"), PREVIEW_TIMELINE["12m"]);
  return qc;
}

const NAV = [
  { label: "Dashboard", icon: LayoutGrid, active: true },
  { label: "Doctors", icon: Stethoscope },
  { label: "Patients", icon: UsersRound },
];

/**
 * The real dashboard (same components as /dashboard) inside an app-window frame.
 * It is laid out at a fixed desktop width and scaled to the space available,
 * so it stays crisp (real text and SVG, not a picture) and keeps the desktop
 * layout at any panel size. Decorative only: inert to mouse, keyboard and
 * screen readers.
 */
const noopSubscribe = () => () => {};

/** The cached sample data is client-only (it stamps the current time), so render after hydration. */
function PreviewData() {
  const [client] = useState(makePreviewClient);
  return (
    <QueryClientProvider client={client}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

export function DashboardPreview({ className, rulerClassName }: { className?: string; rulerClassName?: string }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ scale: number; height: number } | null>(null);

  // Measure only once the dashboard has mounted (client-only), so the first size
  // the page sees is the real one and nothing shifts when it appears.
  useLayoutEffect(() => {
    const box = boxRef.current;
    const frame = frameRef.current;
    if (!isClient || !box || !frame) return;
    const measure = () => {
      const scale = Math.min(1, Math.max(MIN_SCALE, box.clientWidth / DESIGN_WIDTH));
      setSize({ scale, height: frame.offsetHeight * scale });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [isClient]);

  return (
    // The outer box is a shrinkable flex item: on short windows it clips the frame and
    // the mask fades whatever is visible. It extends into the panel's right padding so a
    // frame wider than the column runs off the panel edge rather than being cut early.
    <div className={cn("relative min-h-0 shrink overflow-hidden [mask-image:linear-gradient(to_bottom,black_calc(100%-140px),transparent)]", className)}>
      {/* Zero-height ruler: measures the column width without the bleed. */}
      <div ref={boxRef} className={cn("h-0", rulerClassName)} />
      {/*
        Until measured, hold the space the preview will take (same scale rule, in CSS),
        so the centred headline doesn't start low and jump up when the preview appears.
      */}
      {!size && (
        <div
          aria-hidden="true"
          className={rulerClassName}
          style={{
            aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}`,
            minWidth: DESIGN_WIDTH * MIN_SCALE,
            maxWidth: DESIGN_WIDTH,
          }}
        />
      )}
      <p className="sr-only">Preview of the Doctor Tracker dashboard with sample data.</p>
      <div
        className={cn(
          "overflow-hidden rounded-t-[12px] border border-b-0 border-border bg-background shadow-overlay",
          // Rises in once it has been measured (so it never animates at the wrong size).
          size ? "animate-rise-lg" : "absolute top-0 left-0 opacity-0",
        )}
        style={{
          width: DESIGN_WIDTH * (size?.scale ?? 1),
          height: size ? size.height : undefined,
          ["--delay" as string]: "280ms",
          animationDuration: size ? "1300ms" : undefined,
        }}
      >
        <div
          ref={frameRef}
          inert
          aria-hidden="true"
          className="pointer-events-none flex origin-top-left select-none"
          style={{ width: DESIGN_WIDTH, transform: `scale(${size?.scale ?? 1})` }}
        >
          {/* Sidebar */}
          <div className="flex w-[200px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3">
            <div className="flex h-14 items-center px-1">
              <Logo />
            </div>
            <div className="mt-2 grid gap-0.5">
              {NAV.map(({ label, icon: Icon, active }) => (
                <div
                  key={label}
                  className={`flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium ${active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground"}`}
                >
                  <Icon className={`size-4 ${active ? "text-primary" : "text-subtle-foreground"}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="min-w-0 flex-1">
            <div className="flex h-14 items-center justify-between border-b border-border px-6">
              <p className="text-sm font-medium">Dashboard</p>
              <div className="flex h-8 w-56 items-center gap-2 rounded-md border border-input bg-card px-2.5 text-sm text-subtle-foreground">
                <Search className="size-3.5" /> Search…
              </div>
            </div>
            <div className="px-6 py-6">
              <h3 className="text-[22px] leading-tight font-semibold">Dashboard</h3>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">Doctors, patients and admissions at a glance.</p>
              {isClient && <PreviewData />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
