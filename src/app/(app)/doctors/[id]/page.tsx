import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorDetail } from "@/features/doctors/doctor-detail";

export const metadata: Metadata = { title: "Doctor" };

// Data is fetched on the client (session cookie + TanStack Query cache), so the
// route shell stays static and the id is read with useParams inside Suspense.
export default function DoctorPage() {
  return (
    <Suspense>
      <DoctorDetail />
    </Suspense>
  );
}
