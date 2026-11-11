"use client";

import { ArrowLeft, Building2, CalendarDays, Mail, Pencil, Phone, UsersRound } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ErrorState } from "@/components/feedback/error-state";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatDate, formatNumber, initials } from "@/lib/format";
import { PatientsTable } from "@/features/patients/patients-table";
import { DoctorFormSheet } from "./doctor-form-sheet";
import { useDoctor } from "./queries";

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 px-5 py-3.5 sm:last:col-span-2 xl:last:col-span-1">
      <span className="mt-0.5 text-subtle-foreground [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 truncate text-sm">{children}</div>
      </div>
    </div>
  );
}

export function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: doctor, error, isPending, refetch } = useDoctor(id);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (doctor) document.title = `${doctor.name} · Doctor Tracker`;
  }, [doctor]);

  const back = (
    <Link href="/doctors" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="size-3.5" /> Doctors
    </Link>
  );

  if (error) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400);
    return (
      <>
        {back}
        <Panel className="mt-4">
          {notFound ? (
            <div className="grid place-items-center gap-3 px-5 py-16 text-center">
              <p className="text-sm font-medium">Doctor not found</p>
              <p className="text-[13px] text-muted-foreground">This doctor may have been removed, or the link is wrong.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/doctors">Back to doctors</Link>
              </Button>
            </div>
          ) : (
            <ErrorState error={error} onRetry={() => refetch()} />
          )}
        </Panel>
      </>
    );
  }

  return (
    <>
      {back}
      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-base font-semibold text-primary" aria-hidden="true">
            {doctor ? initials(doctor.name) : ""}
          </span>
          <div className="min-w-0">
            {isPending ? (
              <>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="mt-2 h-4 w-32" />
              </>
            ) : (
              <>
                <h1 className="truncate text-[22px] leading-tight font-semibold">{doctor.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{doctor.specialization}</p>
              </>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditing(true)} disabled={!doctor}>
          <Pencil /> Edit doctor
        </Button>
      </div>

      {/* 1px gaps over a border-coloured background draw the dividers at every column count. */}
      <Panel className="mb-8 grid grid-cols-1 gap-px overflow-hidden bg-border sm:grid-cols-2 xl:grid-cols-5 [&>*]:bg-card">
        {isPending ? (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="px-5 py-3.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          ))
        ) : (
          <>
            <Fact icon={<Building2 />} label="Hospital">
              {doctor.hospital}
            </Fact>
            <Fact icon={<Mail />} label="Email">
              <a href={`mailto:${doctor.email}`} className="hover:underline">
                {doctor.email}
              </a>
            </Fact>
            <Fact icon={<Phone />} label="Phone">
              <a href={`tel:${doctor.phone.replace(/\s/g, "")}`} className="tabular hover:underline">
                {doctor.phone}
              </a>
            </Fact>
            <Fact icon={<UsersRound />} label="Patients">
              <span className="tabular font-medium">{formatNumber(doctor.patientCount ?? 0)}</span>
            </Fact>
            <Fact icon={<CalendarDays />} label="Added">
              <span className="tabular">{formatDate(doctor.createdAt)}</span>
            </Fact>
          </>
        )}
      </Panel>

      <h2 className="mb-3 text-sm font-semibold">Patients</h2>
      {doctor ? (
        <PatientsTable doctor={{ id: doctor.id, name: doctor.name, specialization: doctor.specialization }} />
      ) : (
        <Panel className="h-64" />
      )}

      <DoctorFormSheet open={editing} onOpenChange={setEditing} doctor={doctor} />
    </>
  );
}
