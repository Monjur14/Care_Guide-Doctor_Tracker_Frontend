"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_ITEMS, isActive } from "./nav";

type NavLinksProps = { onNavigate?: () => void; collapsible?: boolean };

/**
 * The active link depends on the pathname, which on dynamic routes (/doctors/[id])
 * is only known at request time. The fallback renders the same links without an
 * active state, so the static shell is complete and the highlight streams in.
 */
export function NavLinks(props: NavLinksProps) {
  return (
    <Suspense fallback={<NavLinksList {...props} pathname="" />}>
      <ActiveNavLinks {...props} />
    </Suspense>
  );
}

function ActiveNavLinks(props: NavLinksProps) {
  return <NavLinksList {...props} pathname={usePathname()} />;
}

function NavLinksList({ onNavigate, collapsible = true, pathname }: NavLinksProps & { pathname: string }) {
  return (
    <nav aria-label="Main" className="grid gap-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        const link = (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group/nav relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150",
              "hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              active && "bg-sidebar-accent text-foreground",
              collapsible && "in-data-[sidebar=collapsed]:justify-center in-data-[sidebar=collapsed]:px-0",
            )}
          >
            <Icon className={cn("size-4 shrink-0 transition-colors", active ? "text-primary" : "text-subtle-foreground group-hover/nav:text-foreground")} />
            <span className={cn(collapsible && "in-data-[sidebar=collapsed]:sr-only")}>{label}</span>
          </Link>
        );
        if (!collapsible) return link;
        return (
          <Tooltip key={href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" className="hidden in-data-[sidebar=collapsed]:block">
              {label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
