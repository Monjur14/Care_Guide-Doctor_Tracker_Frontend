"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@doctor-tracker/shared";
import { Eye, EyeOff, Loader2, UserCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { useLogin } from "./queries";

/**
 * Demo credentials for reviewers. Set NEXT_PUBLIC_DEMO_EMAIL and NEXT_PUBLIC_DEMO_PASSWORD
 * to show the "Use demo admin" button; leave them unset in real deployments to hide it.
 */
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

/** Only allow same-site relative paths, so ?next= can't be used as an open redirect. */
function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/dashboard";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => router.replace(safeNext(params.get("next"))),
      onError: () => form.setFocus("password"),
    }),
  );

  // Demo fill "types" the credentials in (~0.6s) so the reviewer sees what happened.
  const [typing, setTyping] = useState(false);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const fillDemo = () => {
    if (!DEMO_EMAIL || !DEMO_PASSWORD) return;
    const email = DEMO_EMAIL;
    const password = DEMO_PASSWORD;
    login.reset();
    cancelAnimationFrame(frame.current);
    const done = () => {
      form.setValue("email", email, { shouldValidate: true });
      form.setValue("password", password, { shouldValidate: true });
      setTyping(false);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return done();

    const total = email.length + password.length;
    const duration = 900;
    const start = performance.now();
    setTyping(true);
    const step = (now: number) => {
      // Ease-out: fast at first, settling at the end.
      const t = Math.min(1, (now - start) / duration);
      const chars = Math.round((1 - (1 - t) ** 3) * total);
      form.setValue("email", email.slice(0, chars));
      form.setValue("password", password.slice(0, Math.max(0, chars - email.length)));
      if (t < 1) frame.current = requestAnimationFrame(step);
      else done();
    };
    frame.current = requestAnimationFrame(step);
  };

  const apiError = login.error instanceof ApiError ? login.error : login.error ? new ApiError(0, "NETWORK", "Can't reach the server. Check your connection.") : null;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
      {apiError && (
        <div role="alert" className="rounded-md border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
          {apiError.status === 429 ? "Too many failed attempts. Please wait 15 minutes and try again." : apiError.message}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          placeholder="you@hospital.org"
          className="h-9"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...form.register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="h-9 pr-10"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-md text-subtle-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-1 h-9 w-full transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
       
        disabled={login.isPending || typing}
      >
        {login.isPending && <Loader2 className="animate-spin" />}
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>

      {DEMO_EMAIL && DEMO_PASSWORD && (
        <>
          <div className="flex items-center gap-3 text-xs text-subtle-foreground" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
              onClick={fillDemo}
              disabled={login.isPending || typing}
            >
              <UserCheck />
              Use demo admin account
            </Button>
            <p className="text-center text-xs text-subtle-foreground">Reviewing the project? This fills in the demo credentials.</p>
          </div>
        </>
      )}
    </form>
  );
}
