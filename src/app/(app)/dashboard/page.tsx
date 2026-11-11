import type { Metadata } from "next";
import { PageHeader } from "@/components/panel";
import { DashboardContent } from "@/features/dashboard/dashboard-content";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Doctors, patients and admissions at a glance." />
      <DashboardContent />
    </>
  );
}
