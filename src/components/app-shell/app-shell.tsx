"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Menu, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { setUnauthorizedHandler } from "@/lib/api";
import { CommandMenu } from "./command-menu";
import { NavLinks } from "./nav-links";
import { titleFor } from "./nav";
import { toggleSidebar } from "./sidebar-state";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  // An expired or revoked session anywhere in the app sends the user to /login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    });
  }, [queryClient, router]);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 pb-3 transition-[width] duration-300 ease-out-quint md:flex in-data-[sidebar=collapsed]:w-[60px] in-data-[sidebar=collapsed]:px-2">
        <div className="flex h-14 items-center px-1 in-data-[sidebar=collapsed]:justify-center in-data-[sidebar=collapsed]:px-0">
          <Link href="/dashboard" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            <Logo className="in-data-[sidebar=collapsed]:[&>span:last-child]:hidden" />
          </Link>
        </div>
        <div className="mt-2 flex-1">
          <NavLinks />
        </div>
        <UserMenu />
      </aside>

      {/* Mobile navigation */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] gap-0 bg-sidebar p-3">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>
          <div className="flex h-11 items-center px-1">
            <Logo />
          </div>
          <div className="mt-3 flex-1">
            <NavLinks collapsible={false} onNavigate={() => setMobileOpen(false)} />
          </div>
          <UserMenu collapsible={false} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6">
          <Button variant="ghost" size="icon" className="-ml-1.5 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2 hidden text-subtle-foreground md:inline-flex" onClick={toggleSidebar} aria-label="Toggle sidebar">
                <PanelLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle sidebar</TooltipContent>
          </Tooltip>
          <span className="hidden h-4 w-px bg-border md:block" aria-hidden="true" />
          <p className="ml-1 truncate text-sm font-medium">
            {/* Pathname is request data on dynamic routes (/doctors/[id]); keep it inside Suspense. */}
            <Suspense fallback="Doctor Tracker">
              <PageTitle />
            </Suspense>
          </p>
          <div className="ml-auto flex items-center justify-end gap-1 sm:w-full sm:max-w-72 sm:gap-1.5">
            <CommandMenu />
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function PageTitle() {
  return titleFor(usePathname());
}
