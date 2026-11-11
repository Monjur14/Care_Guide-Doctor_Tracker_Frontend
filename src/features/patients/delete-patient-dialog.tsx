"use client";

import type { Patient } from "@doctor-tracker/shared";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api";
import { useDeletePatient } from "./queries";

export function DeletePatientDialog({ patient, onOpenChange }: { patient: Patient | null; onOpenChange: (open: boolean) => void }) {
  const remove = useDeletePatient();

  const confirm = (e: React.MouseEvent) => {
    e.preventDefault(); // keep the dialog open until the request settles
    if (!patient) return;
    remove.mutate(patient.id, {
      onSuccess: () => {
        toast.success(`${patient.name} deleted`);
        onOpenChange(false);
      },
      onError: (err) => {
        // Already gone (e.g. deleted in another tab): treat as done.
        if (err instanceof ApiError && err.status === 404) onOpenChange(false);
        toast.error(err instanceof ApiError ? err.message : "Couldn't delete the patient. Try again.");
      },
    });
  };

  return (
    <AlertDialog open={!!patient} onOpenChange={(o) => !remove.isPending && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {patient?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the patient{patient?.doctor ? ` from ${patient.doctor.name}'s list` : ""}. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirm} disabled={remove.isPending}>
            {remove.isPending && <Loader2 className="animate-spin" />}
            Delete patient
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
