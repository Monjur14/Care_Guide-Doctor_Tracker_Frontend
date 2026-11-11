"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { doctorCreateSchema, SPECIALIZATIONS, type Doctor } from "@doctor-tracker/shared";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { fieldAria, FormField } from "@/components/form-field";
import { FormError, FormSheet } from "@/components/form-sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applyServerErrors } from "@/lib/form-errors";
import { useFilterOptions } from "@/features/meta/queries";
import { useCreateDoctor, useUpdateDoctor } from "./queries";

type FormIn = z.input<typeof doctorCreateSchema>;
type FormOut = z.output<typeof doctorCreateSchema>;
const FIELDS = ["name", "specialization", "hospital", "phone", "email"] as const;

const EMPTY: FormIn = { name: "", specialization: undefined as unknown as FormIn["specialization"], hospital: "", phone: "", email: "" };

function toValues(d?: Doctor | null): FormIn {
  return d ? { name: d.name, specialization: d.specialization, hospital: d.hospital, phone: d.phone, email: d.email } : EMPTY;
}

/** Create a doctor, or edit one when `doctor` is given. */
export function DoctorFormSheet({
  open,
  onOpenChange,
  doctor,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
  onCreated?: (doctor: Doctor) => void;
}) {
  const formId = useId();
  const isEdit = !!doctor;
  const create = useCreateDoctor();
  const update = useUpdateDoctor(doctor?.id ?? "");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit doctor" : "New doctor"}
      description={isEdit ? "Update this doctor's details." : "Add a doctor to start assigning patients."}
      formId={formId}
      submitLabel={isEdit ? "Save changes" : "Add doctor"}
      pending={(isEdit ? update : create).isPending}
    >
      <DoctorForm
        formId={formId}
        doctor={doctor}
        save={async (values) => {
          if (isEdit) {
            await update.mutateAsync(values);
            toast.success("Doctor updated");
          } else {
            const created = await create.mutateAsync(values);
            toast.success(`${created.name} added`);
            onCreated?.(created);
          }
          onOpenChange(false);
        }}
      />
    </FormSheet>
  );
}

/** Mounted only while the drawer is open, so every open starts from fresh values. */
function DoctorForm({ formId, doctor, save }: { formId: string; doctor?: Doctor | null; save: (values: FormOut) => Promise<void> }) {
  const { data: options } = useFilterOptions();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormIn, unknown, FormOut>({ resolver: zodResolver(doctorCreateSchema), defaultValues: toValues(doctor) });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await save(values);
    } catch (err) {
      setFormError(applyServerErrors(err, FIELDS, form.setError));
    }
  });

  const hospitalsListId = `${formId}-hospitals`;

  return (
    <>
      <FormError message={formError} />
      <form id={formId} onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormField id="doctor-name" label="Full name" error={errors.name?.message}>
          <Input className="h-9" {...fieldAria("doctor-name", errors.name?.message)} placeholder="Dr. Ayesha Rahman" autoComplete="off" {...form.register("name")} />
        </FormField>

        <FormField id="doctor-specialization" label="Specialization" error={errors.specialization?.message && "Choose a specialization"}>
          <Controller
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger {...fieldAria("doctor-specialization", errors.specialization?.message)} ref={field.ref} onBlur={field.onBlur} className="h-9 w-full">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-72">
                  {SPECIALIZATIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField id="doctor-hospital" label="Hospital" error={errors.hospital?.message} hint="Pick an existing hospital or type a new one.">
          <Input className="h-9" {...fieldAria("doctor-hospital", errors.hospital?.message)} list={hospitalsListId} placeholder="Square Hospital" autoComplete="off" {...form.register("hospital")} />
          <datalist id={hospitalsListId}>
            {options?.hospitals.map((h) => <option key={h} value={h} />)}
          </datalist>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="doctor-phone" label="Phone" error={errors.phone?.message}>
            <Input className="h-9" {...fieldAria("doctor-phone", errors.phone?.message)} type="tel" inputMode="tel" placeholder="+880 1711 123456" autoComplete="off" {...form.register("phone")} />
          </FormField>
          <FormField id="doctor-email" label="Email" error={errors.email?.message}>
            <Input className="h-9" {...fieldAria("doctor-email", errors.email?.message)} type="email" placeholder="name@hospital.org" autoComplete="off" {...form.register("email")} />
          </FormField>
        </div>
      </form>
    </>
  );
}
