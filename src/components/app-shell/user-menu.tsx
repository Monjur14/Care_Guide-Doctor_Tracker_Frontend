"use client";

import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout, useMe } from "@/features/auth/queries";

export function UserMenu({ collapsible = true }: { collapsible?: boolean }) {
  const { data: user, isPending } = useMe();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const initial = user?.email[0]?.toUpperCase() ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-md px-2 text-left text-sm transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-sidebar-accent",
          collapsible && "in-data-[sidebar=collapsed]:justify-center in-data-[sidebar=collapsed]:px-0",
        )}
        aria-label="Account menu"
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
          {initial}
        </span>
        <span className={cn("min-w-0 flex-1", collapsible && "in-data-[sidebar=collapsed]:hidden")}>
          {isPending ? (
            <Skeleton className="h-3.5 w-28" />
          ) : (
            <>
              <span className="block truncate font-medium leading-tight">{user?.email}</span>
              <span className="block text-xs capitalize leading-tight text-subtle-foreground">{user?.role}</span>
            </>
          )}
        </span>
        <ChevronsUpDown className={cn("size-3.5 text-subtle-foreground", collapsible && "in-data-[sidebar=collapsed]:hidden")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-subtle-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
