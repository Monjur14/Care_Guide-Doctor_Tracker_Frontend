import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorsView } from "@/features/doctors/doctors-view";

export const metadata: Metadata = { title: "Doctors" };

// The view reads its filters from the URL, so it renders inside Suspense.
export default function DoctorsPage() {
  return (
    <Suspense>
      <DoctorsView />
    </Suspense>
  );
}
