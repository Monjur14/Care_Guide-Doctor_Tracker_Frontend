"use client";

import { CONDITIONS, GENDERS, PATIENT_STATUSES, type DoctorSummary, type Patient } from "@doctor-tracker/shared";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { cn } from "cn";
import { DateRangeFilter } from "@/components/data-table/date-range-filter";
import { FilterSelect, toOptions } from "@/components/data-table/filter-select";
import { PaginationBar } from "@/components/data-table/pagination-bar";
import { SearchInput } from "@/components/data-table/search-input";
import { SortableHead } from "@/components/data-table/sortable-head";
import { EmptyRow, SkeletonRows } from "@/components/data-table/table-states";
import { ErrorState } from "@/components/feedback/error-state";
import { Panel } from "@/components/panel";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dayRangeQuery, formatDate } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import { DoctorPicker } from "@/features/doctors/doctor-picker";
import { useDoctor } from "@/features/doctors/queries";
import { DeletePatientDialog } from "./delete-patient-dialog";
import { GENDER_LABEL } from "./labels";
import { PatientFormSheet } from "./patient-form-sheet";
import { usePatients } from "./queries";
import { patientSearchParams } from "./search-params";

const STATUS_OPTIONS = PATIENT_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label }));
const GENDER_OPTIONS = GENDERS.map((g) => ({ value: g, label: GENDER_LABEL[g] }));

/** The doctor in the ?doctor= filter, for the picker's label (one cached lookup, only when set). */
function useDoctorFilter(id: string | null): DoctorSummary | null {
  const { data } = useDoctor(id ?? "", { enabled: !!id });
  if (!id) return null;
  return data ? { id, name: data.name, specialization: data.specialization } : { id, name: "Loading…", specialization: "General Medicine" };
}

/**
 * Patients table with search, filters, sorting and pagination, all in the URL.
 * With `doctor`, it lists only that doctor's patients and adds new ones under them.
 */
export function PatientsTable({ doctor }: { doctor?: DoctorSummary }) {
  const scoped = !!doctor;
  const [params, setParams] = useQueryStates(patientSearchParams, { history: "replace" });
  const [sheet, setSheet] = useState<{ open: boolean; patient: Patient | null }>({ open: false, patient: null });
  const [toDelete, setToDelete] = useState<Patient | null>(null);
  const doctorFilter = useDoctorFilter(scoped ? null : params.doctor);

  const limit = Number(params.limit);
  const { data, error, isPending, isPlaceholderData, refetch } = usePatients({
    page: params.page,
    limit,
    search: params.q || undefined,
    status: params.status ?? undefined,
    condition: params.condition ?? undefined,
    gender: params.gender ?? undefined,
    doctorId: doctor?.id ?? params.doctor ?? undefined,
    sort: params.sort,
    order: params.order,
    ...dayRangeQuery(params.from, params.to),
  });

  // After a delete empties the last page, step back to the new last page.
  const totalPages = data?.meta.totalPages ?? 0;
  useEffect(() => {
    if (totalPages > 0 && params.page > totalPages) setParams({ page: totalPages });
  }, [totalPages, params.page, setParams]);

  const setFilter = (patch: Partial<typeof params>) => setParams({ ...patch, page: 1 });
  const hasFilters = !!(params.q || params.status || params.condition || params.gender || params.from || params.to || (!scoped && params.doctor));
  const clearFilters = () => setFilter({ q: "", status: null, condition: null, gender: null, from: null, to: null, doctor: null });
  const onSort = (sort: typeof params.sort, order: typeof params.order) => setParams({ sort, order, page: 1 });
  const columns = scoped ? 6 : 7;

  return (
    <>
      <Panel>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <SearchInput value={params.q} onChange={(q) => setFilter({ q })} placeholder="Search name, email, phone…" className="w-full sm:w-64" />
          <FilterSelect label="Statuses" value={params.status} options={STATUS_OPTIONS} onChange={(v) => setFilter({ status: v as typeof params.status })} />
          <FilterSelect label="Conditions" value={params.condition} options={toOptions(CONDITIONS)} onChange={(v) => setFilter({ condition: v as typeof params.condition })} />
          <FilterSelect label="Genders" value={params.gender} options={GENDER_OPTIONS} onChange={(v) => setFilter({ gender: v as typeof params.gender })} className="min-w-28" />
          {!scoped && <DoctorPicker variant="filter" value={doctorFilter} onChange={(d) => setFilter({ doctor: d?.id ?? null })} />}
          <DateRangeFilter label="Admission date" value={{ from: params.from, to: params.to }} onChange={(r) => setFilter(r)} />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              Clear filters
            </Button>
          )}
          <Button className="ml-auto" onClick={() => setSheet({ open: true, patient: null })}>
            <Plus /> {scoped ? "Add patient" : "New patient"}
          </Button>
        </div>

        {error && !data ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <>
            <Table className={cn("transition-opacity", isPlaceholderData && "opacity-60")} aria-busy={isPending || isPlaceholderData}>
              <TableHeader className="border-t border-border bg-muted/40 text-xs [&_th]:font-medium [&_th]:text-muted-foreground">
                <TableRow className="hover:bg-transparent">
                  <SortableHead field="name" sort={params.sort} order={params.order} onSort={onSort} className="pl-4">
                    Patient
                  </SortableHead>
                  <SortableHead field="age" sort={params.sort} order={params.order} onSort={onSort} className="hidden sm:table-cell">
                    Age
                  </SortableHead>
                  <TableHead className="hidden sm:table-cell">Condition</TableHead>
                  <TableHead>Status</TableHead>
                  {!scoped && <TableHead className="hidden lg:table-cell">Doctor</TableHead>}
                  <SortableHead field="admissionDate" sort={params.sort} order={params.order} onSort={onSort} className="hidden md:table-cell">
                    Admitted
                  </SortableHead>
                  <TableHead className="w-10 pr-3">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <SkeletonRows rows={Math.min(limit, 10)} columns={columns} />
                ) : data.data.length === 0 ? (
                  <EmptyRow
                    columns={columns}
                    title={hasFilters ? "No patients match these filters" : scoped ? "No patients yet" : "No patients yet"}
                    description={hasFilters ? "Try a different search or clear the filters." : scoped ? `Add the first patient under ${doctor.name}.` : "Patients you add will show up here."}
                    action={
                      hasFilters ? (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setSheet({ open: true, patient: null })}>
                          <Plus /> Add patient
                        </Button>
                      )
                    }
                  />
                ) : (
                  data.data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="py-2.5 pl-4">
                        <button
                          type="button"
                          onClick={() => setSheet({ open: true, patient: p })}
                          className="block max-w-56 truncate text-left font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                        >
                          {p.name}
                        </button>
                        <p className="max-w-56 truncate text-xs text-muted-foreground">
                          {/* On phones age and condition fold in here. */}
                          <span className="sm:hidden">
                            {p.age} · {p.condition}
                          </span>
                          <span className="hidden sm:inline">{p.email}</span>
                        </p>
                      </TableCell>
                      <TableCell className="tabular hidden text-muted-foreground sm:table-cell">
                        {p.age} <span className="text-subtle-foreground">· {GENDER_LABEL[p.gender]}</span>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{p.condition}</TableCell>
                      <TableCell>
                        <StatusPill status={p.status} />
                      </TableCell>
                      {!scoped && (
                        <TableCell className="hidden max-w-52 lg:table-cell">
                          {p.doctor ? (
                            <Link href={`/doctors/${p.doctor.id}`} className="block truncate text-muted-foreground hover:text-foreground hover:underline">
                              {p.doctor.name}
                            </Link>
                          ) : (
                            <span className="text-subtle-foreground">Unassigned</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="tabular hidden text-muted-foreground md:table-cell">{formatDate(p.admissionDate)}</TableCell>
                      <TableCell className="pr-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${p.name}`} className="text-subtle-foreground">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onSelect={() => setSheet({ open: true, patient: p })}>
                              <Pencil /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(p)}>
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {data && (
              <PaginationBar
                meta={data.meta}
                noun="patients"
                onPageChange={(page) => setParams({ page })}
                onLimitChange={(l) => setParams({ limit: String(l) as typeof params.limit, page: 1 })}
              />
            )}
          </>
        )}
      </Panel>

      <PatientFormSheet open={sheet.open} patient={sheet.patient} doctor={doctor ?? null} onOpenChange={(open) => setSheet((s) => ({ ...s, open }))} />
      <DeletePatientDialog patient={toDelete} onOpenChange={(open) => !open && setToDelete(null)} />
    </>
  );
}
