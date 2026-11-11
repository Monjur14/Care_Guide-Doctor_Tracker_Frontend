"use client";

import { SPECIALIZATIONS, type Doctor } from "@doctor-tracker/shared";
import { MoreHorizontal, Pencil, Plus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { PageHeader, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dayRangeQuery, formatDate, formatNumber, initials } from "@/lib/format";
import { useFilterOptions } from "@/features/meta/queries";
import { DoctorFormSheet } from "./doctor-form-sheet";
import { useDoctors } from "./queries";
import { doctorSearchParams } from "./search-params";

const COLUMNS = 6;

export function DoctorsView() {
  const router = useRouter();
  const [params, setParams] = useQueryStates(doctorSearchParams, { history: "replace" });
  const { data: options } = useFilterOptions();
  const [sheet, setSheet] = useState<{ open: boolean; doctor: Doctor | null }>({ open: false, doctor: null });

  const limit = Number(params.limit);
  const query = useDoctors({
    page: params.page,
    limit,
    search: params.q || undefined,
    specialization: params.specialization ?? undefined,
    hospital: params.hospital ?? undefined,
    sort: params.sort,
    order: params.order,
    ...dayRangeQuery(params.from, params.to),
  });
  const { data, error, isPending, isPlaceholderData, refetch } = query;

  // A page past the end (stale link, fewer results now) snaps to the last page.
  const totalPages = data?.meta.totalPages ?? 0;
  useEffect(() => {
    if (totalPages > 0 && params.page > totalPages) setParams({ page: totalPages });
  }, [totalPages, params.page, setParams]);

  // Any filter change goes back to page 1.
  const setFilter = (patch: Partial<typeof params>) => setParams({ ...patch, page: 1 });
  const hasFilters = !!(params.q || params.specialization || params.hospital || params.from || params.to);
  const clearFilters = () => setFilter({ q: "", specialization: null, hospital: null, from: null, to: null });

  const openDoctor = (id: string) => router.push(`/doctors/${id}`);

  return (
    <>
      <PageHeader
        title="Doctors"
        description="Everyone on staff, their specialty and how many patients they look after."
        actions={
          <Button onClick={() => setSheet({ open: true, doctor: null })}>
            <Plus /> New doctor
          </Button>
        }
      />

      <Panel>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <SearchInput
            value={params.q}
            onChange={(q) => setFilter({ q })}
            placeholder="Search name, email, hospital…"
            className="w-full sm:w-72"
          />
          <FilterSelect label="Specializations" value={params.specialization} options={toOptions(SPECIALIZATIONS)} onChange={(v) => setFilter({ specialization: v as typeof params.specialization })} />
          <FilterSelect label="Hospitals" value={params.hospital} options={toOptions(options?.hospitals ?? [])} onChange={(hospital) => setFilter({ hospital })} className="max-w-56" />
          <DateRangeFilter label="Date added" value={{ from: params.from, to: params.to }} onChange={(r) => setFilter(r)} />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              Clear filters
            </Button>
          )}
        </div>

        {error && !data ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <>
            <Table className={cn("transition-opacity", isPlaceholderData && "opacity-60")} aria-busy={isPending || isPlaceholderData}>
              <TableHeader className="border-t border-border bg-muted/40 text-xs text-muted-foreground [&_th]:font-medium [&_th]:text-muted-foreground">
                <TableRow className="hover:bg-transparent">
                  <SortableHead field="name" sort={params.sort} order={params.order} onSort={(sort, order) => setParams({ sort, order, page: 1 })} className="pl-4">
                    Doctor
                  </SortableHead>
                  <TableHead className="hidden sm:table-cell">Specialization</TableHead>
                  <TableHead className="hidden xl:table-cell">Hospital</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Patients</TableHead>
                  <SortableHead field="createdAt" sort={params.sort} order={params.order} onSort={(sort, order) => setParams({ sort, order, page: 1 })} className="hidden pr-2 md:table-cell">
                    Added
                  </SortableHead>
                  <TableHead className="w-10 pr-3">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <SkeletonRows rows={limit > 10 ? 10 : limit} columns={COLUMNS + 1} />
                ) : data.data.length === 0 ? (
                  <EmptyRow
                    columns={COLUMNS + 1}
                    title={hasFilters ? "No doctors match these filters" : "No doctors yet"}
                    description={hasFilters ? "Try a different search or clear the filters." : "Add your first doctor to start tracking patients."}
                    action={
                      hasFilters ? (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setSheet({ open: true, doctor: null })}>
                          <Plus /> New doctor
                        </Button>
                      )
                    }
                  />
                ) : (
                  data.data.map((d) => (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button,a,[role=menuitem]")) return;
                        openDoctor(d.id);
                      }}
                    >
                      <TableCell className="py-2.5 pl-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary" aria-hidden="true">
                            {initials(d.name)}
                          </span>
                          <div className="min-w-0">
                            {/* The real link: keyboard, middle-click and screen readers get a proper anchor. */}
                            <a
                              href={`/doctors/${d.id}`}
                              onClick={(e) => {
                                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                                e.preventDefault();
                                openDoctor(d.id);
                              }}
                              className="block max-w-56 truncate font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                            >
                              {d.name}
                            </a>
                            <p className="max-w-56 truncate text-xs text-muted-foreground">
                              {/* On phones the specialization column folds in here. */}
                              <span className="sm:hidden">{d.specialization}</span>
                              <span className="hidden sm:inline">{d.email}</span>
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{d.specialization}</TableCell>
                      <TableCell className="hidden max-w-60 truncate text-muted-foreground xl:table-cell">{d.hospital}</TableCell>
                      <TableCell className="tabular hidden text-muted-foreground 2xl:table-cell">{d.phone}</TableCell>
                      <TableCell className="tabular text-right font-medium">{formatNumber(d.patientCount ?? 0)}</TableCell>
                      <TableCell className="tabular hidden text-muted-foreground md:table-cell">{formatDate(d.createdAt)}</TableCell>
                      <TableCell className="pr-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${d.name}`} className="text-subtle-foreground">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onSelect={() => openDoctor(d.id)}>
                              <UserRound /> View patients
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSheet({ open: true, doctor: d })}>
                              <Pencil /> Edit doctor
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
                noun="doctors"
                onPageChange={(page) => setParams({ page })}
                onLimitChange={(l) => setParams({ limit: String(l) as typeof params.limit, page: 1 })}
              />
            )}
          </>
        )}
      </Panel>

      <DoctorFormSheet
        open={sheet.open}
        doctor={sheet.doctor}
        onOpenChange={(open) => setSheet((s) => ({ ...s, open }))}
        onCreated={(d) => openDoctor(d.id)}
      />
    </>
  );
}
