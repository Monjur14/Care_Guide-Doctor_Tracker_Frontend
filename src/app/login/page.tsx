import { Activity, LockKeyhole, Stethoscope, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { DashboardPreview } from "@/features/auth/dashboard-preview";
import { LoginForm } from "@/features/auth/login-form";

/** Inline stagger + duration for the right-panel entrance (keyframes: `animate-rise` in globals.css). */
const delay = (ms: number) => ({ "--delay": `${ms}ms`, animationDuration: "900ms" }) as CSSProperties;

export const metadata: Metadata = { title: "Sign in" };

const FEATURES = [
  { icon: Stethoscope, label: "Doctors by specialty and hospital" },
  { icon: UsersRound, label: "Patients, status and assignments" },
  { icon: Activity, label: "Admission trends at a glance" },
];

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(480px,2fr)_3fr]">
      {/* Form column: shown immediately, it is what the visitor came for. */}
      <section className="relative flex flex-col px-6 py-8 sm:px-12 lg:px-14">
        {/* On small screens the accent wash stands in for the product panel. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_70%)] lg:hidden"
        />
        <Logo className="relative" />
        <div className="relative mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center py-12 2xl:max-w-[400px]">
          <p className="text-xs font-medium tracking-[0.08em] text-primary uppercase">
            Admin portal
          </p>
          <h1 className="mt-3 text-[28px] leading-[1.15] font-semibold tracking-[-0.02em]">Sign in to Doctor Tracker</h1>
          <p className="mt-2 text-[15px] text-pretty text-muted-foreground">Manage doctors, patients and admissions from one place.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <footer className="relative flex flex-wrap items-center justify-between gap-2 text-xs text-subtle-foreground">
          <span className="inline-flex items-center gap-1.5">
            <LockKeyhole className="size-3.5" /> Authorized personnel only · activity is logged
          </span>
          <span>© 2026 Doctor Tracker</span>
        </footer>
      </section>

      {/* Product panel: the real dashboard, so the reviewer sees what's behind the door. */}
      <aside
        aria-label="Product preview"
        className="relative hidden overflow-hidden border-l border-border bg-[color-mix(in_oklch,var(--primary)_5%,var(--background))] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col"
      >
        {/* Faint dot grid fading toward the bottom. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="animate-drift pointer-events-none absolute -top-40 right-0 size-[640px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_65%)]"
        />

        {/*
          Headline + live dashboard preview form one block, centred in the panel on big
          monitors. The preview scales to the panel width (down to a readable minimum, then
          runs off the right edge); when the window is short it is clipped and fades out.
        */}
        <div className="relative mx-auto flex h-full w-full max-w-[1340px] flex-col justify-center px-14 py-12 xl:px-20 [@media(min-height:900px)]:py-16">
          <h2 style={delay(60)} className="animate-rise max-w-[520px] text-[34px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance xl:text-[40px]">
            Every doctor, every patient, <span className="text-primary">one calm view.</span>
          </h2>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <li key={label} style={delay(160 + i * 80)} className="animate-rise inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4 text-primary" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <DashboardPreview className="mt-10 -mr-14 xl:-mr-20" rulerClassName="mr-14 xl:mr-20" />
        </div>
      </aside>
    </main>
  );
}
