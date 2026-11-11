"use client";

import { PageHeader } from "@/components/panel";
import { PatientsTable } from "./patients-table";

export function PatientsView() {
  return (
    <>
      <PageHeader title="Patients" description="Every patient across all doctors. Search, filter, edit or remove records." />
      <PatientsTable />
    </>
  );
}
