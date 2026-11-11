"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CONDITIONS,
  GENDERS,
  objectIdSchema,
  PATIENT_STATUSES,
  patientCreateSchema,
  type DoctorSummary,
  type Patient,
} from "@doctor-tracker/shared";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { fieldAria, FormField } from "@/components/form-field";
import { FormError, FormSheet } from "@/components/form-sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applyServerErrors } from "@/lib/form-errors";
import { todayInput, toDateInput } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import { DoctorPicker } from "@/features/doctors/doctor-picker";
import { GENDER_LABEL } from "./labels";
import { useCreatePatient, useUpdatePatient } from "./queries";

/** The shared create schema plus the doctor the patient is assigned to. */
const formSchema = patientCreateSchema.extend({ doctorId: objectIdSchema });
type FormIn = z.input<typeof formSchema>;
type FormOut = z.output<typeof formSchema>;
const FIELDS = ["name", "age", "gender", "phone", "email", "condition", "status", "admissionDate", "doctorId"] as const;

function toValues(p: Patient | null | undefined, doctor: DoctorSummary | null): FormIn {
  if (p) {
    return {
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      condition: p.condition,
      status: p.status,
      admissionDate: toDateInput(p.admissionDate),
      doctorId: p.doctor?.id ?? "",
    };
  }
  return {
    name: "",
    // undefined (not "") so an untouched box fails validation instead of coercing to 0.
    age: undefined,
    gender: undefined as unknown as FormIn["gender"],
    phone: "",
    email: "",
    condition: undefined as unknown as FormIn["condition"],
    status: "admitted",
    admissionDate: todayInput(),
    doctorId: doctor?.id ?? "",
  };
}

/**
 * Add a patient (under `doctor` when given) or edit one when `patient` is given.
 * Editing also allows reassigning the patient to another doctor.
 */
export function PatientFormSheet({
  open,
  onOpenChange,
  patient,
  doctor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  /** Pre-selected (and, when adding from a doctor's page, fixed) doctor. */
  doctor?: DoctorSummary | null;
}) {
  const formId = useId();
  const isEdit = !!patient;
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const doctorLocked = !isEdit && !!doctor;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit patient" : "New patient"}
      description={doctorLocked ? `Adding a patient under ${doctor!.name}.` : isEdit ? "Update details, status or assigned doctor." : "Register a patient and assign a doctor."}
      formId={formId}
      submitLabel={isEdit ? "Save changes" : "Add patient"}
      pending={(isEdit ? update : create).isPending}
    >
      <PatientForm
        formId={formId}
        patient={patient}
        doctor={doctor ?? null}
        doctorLocked={doctorLocked}
        save={async ({ doctorId, ...input }) => {
          if (patient) {
            await update.mutateAsync({ id: patient.id, input: { ...input, doctorId } });
            toast.success("Patient updated");
          } else {
            const created = await create.mutateAsync({ doctorId, input });
            toast.success(`${created.name} added${created.doctor ? ` under ${created.doctor.name}` : ""}`);
          }
          onOpenChange(false);
        }}
      />
    </FormSheet>
  );
}

/** Mounted only while the drawer is open, so every open starts from fresh values. */
function PatientForm({
  formId,
  patient,
  doctor,
  doctorLocked,
  save,
}: {
  formId: string;
  patient?: Patient | null;
  doctor: DoctorSummary | null;
  doctorLocked: boolean;
  save: (values: FormOut) => Promise<void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSummary | null>(patient?.doctor ?? doctor);
  const form = useForm<FormIn, unknown, FormOut>({ resolver: zodResolver(formSchema), defaultValues: toValues(patient, doctor) });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await save(values);
    } catch (err) {
      setFormError(applyServerErrors(err, FIELDS, form.setError));
    }
  });

  const err = (k: (typeof FIELDS)[number]) => errors[k]?.message;

  return (
    <>
      <FormError message={formError} />
      <form id={formId} onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormField id="patient-name" label="Full name" error={err("name")}>
          <Input className="h-9" {...fieldAria("patient-name", err("name"))} placeholder="Rahim Uddin" autoComplete="off" {...form.register("name")} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="patient-age" label="Age" error={err("age") && "Enter an age between 0 and 130"}>
            <Input className="h-9" {...fieldAria("patient-age", err("age"))} type="number" inputMode="numeric" min={0} max={130} step={1} {...form.register("age", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })} />
          </FormField>
          <FormField id="patient-gender" label="Gender" error={err("gender") && "Choose a gender"}>
            <Controller
              control={form.control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger {...fieldAria("patient-gender", err("gender"))} ref={field.ref} className="h-9 w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {GENDER_LABEL[g]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="patient-phone" label="Phone" error={err("phone")}>
            <Input className="h-9" {...fieldAria("patient-phone", err("phone"))} type="tel" inputMode="tel" placeholder="+880 1811 654321" autoComplete="off" {...form.register("phone")} />
          </FormField>
          <FormField id="patient-email" label="Email" error={err("email")}>
            <Input className="h-9" {...fieldAria("patient-email", err("email"))} type="email" placeholder="name@example.com" autoComplete="off" {...form.register("email")} />
          </FormField>
        </div>

        <div className="mt-1 border-t border-border pt-5" />

        <div className="grid grid-cols-2 gap-4">
          <FormField id="patient-condition" label="Condition" error={err("condition") && "Choose a condition"}>
            <Controller
              control={form.control}
              name="condition"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger {...fieldAria("patient-condition", err("condition"))} ref={field.ref} className="h-9 w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-72">
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField id="patient-status" label="Status" error={err("status")}>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger {...fieldAria("patient-status", err("status"))} ref={field.ref} className="h-9 w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {PATIENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        <span className="size-2 rounded-full" style={{ background: STATUS_META[s].colorVar }} aria-hidden="true" />
                        {STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <FormField id="patient-admission" label="Admission date" error={err("admissionDate")}>
          <Input className="h-9" {...fieldAria("patient-admission", err("admissionDate"))} type="date" max={todayInput()} {...form.register("admissionDate")} />
        </FormField>

        <FormField id="patient-doctor" label="Assigned doctor" error={err("doctorId") && "Choose a doctor"}>
          {doctorLocked ? (
            <p className="flex h-9 items-center rounded-lg border border-input bg-muted/50 px-2.5 text-sm">
              {doctor!.name}
              <span className="ml-2 text-xs text-muted-foreground">{doctor!.specialization}</span>
            </p>
          ) : (
            <Controller
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <DoctorPicker
                  ref={field.ref}
                  id="patient-doctor"
                  invalid={!!err("doctorId")}
                  describedBy={err("doctorId") ? "patient-doctor-error" : undefined}
                  value={selectedDoctor}
                  onChange={(d) => {
                    setSelectedDoctor(d);
                    field.onChange(d?.id ?? "");
                  }}
                />
              )}
            />
          )}
        </FormField>
      </form>
    </>
  );
}
