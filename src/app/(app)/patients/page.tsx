import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientsView } from "@/features/patients/patients-view";

export const metadata: Metadata = { title: "Patients" };

// The view reads its filters from the URL, so it renders inside Suspense.
export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsView />
    </Suspense>
  );
}
