import { LayoutGrid, Stethoscope, UsersRound, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, shortcut: "G D" },
  { href: "/doctors", label: "Doctors", icon: Stethoscope, shortcut: "G O" },
  { href: "/patients", label: "Patients", icon: UsersRound, shortcut: "G P" },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function titleFor(pathname: string) {
  return NAV_ITEMS.find((item) => isActive(pathname, item.href))?.label ?? "Doctor Tracker";
}
