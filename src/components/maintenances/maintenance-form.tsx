"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/field";
import { FilePicker } from "@/components/shared/file-picker";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { VehicleSelectField } from "@/components/shared/vehicle-select-field";
import { readLastVehicle, saveLastVehicle } from "@/hooks/use-last-vehicle";
import { apiFetch } from "@/lib/api";
import { appendOptional, handleSubmitError } from "@/lib/form";
import { formatNumber, nowInputValue, parseDecimal, toInputDate, toInputDateTime } from "@/lib/format";
import type { Maintenance, Supplier, Vehicle } from "@/types";

const optionalInteger = z.string().trim().refine((value) => value === "" || /^\d+$/.test(value), "Inserisci solo numeri interi.");

function createSchema(requireAttachment: boolean) {
  return z
    .object({
      date: z.string().min(1, "Inserisci data e ora."),
      supplier_id: z.string().min(1, "Seleziona un fornitore."),
      vehicle_id: z.string().min(1, "Seleziona un veicolo."),
      km: z.string().trim().min(1, "Inserisci i km della manutenzione.").regex(/^\d+$/, "Inserisci solo numeri interi."),
      km_after: optionalInteger,
      next_maintenance_date: z.string(),
      invoice_number: z.string().trim().min(1, "Inserisci il numero di bolla."),
      price: z
        .string()
        .trim()
        .min(1, "Inserisci il prezzo.")
        .refine((value) => Number.isFinite(parseDecimal(value)) && parseDecimal(value) >= 0, "Inserisci un prezzo valido."),
      notes: z.string().trim().min(1, "Inserisci i dettagli dell'intervento."),
      attachment: requireAttachment
        ? z.instanceof(File, { message: "L'allegato è obbligatorio." })
        : z.instanceof(File).optional(),
    })
    .superRefine((values, context) => {
      if (values.km_after !== "" && /^\d+$/.test(values.km) && Number(values.km_after) <= Number(values.km)) {
        context.addIssue({
          code: "custom",
          path: ["km_after"],
          message: "I km della prossima manutenzione devono essere maggiori dei km attuali.",
        });
      }
    });
}

type MaintenanceValues = z.infer<ReturnType<typeof createSchema>>;

interface MaintenanceFormProps {
  vehicles: Vehicle[];
  suppliers: Supplier[];
  maintenance?: Maintenance;
  onSaved: () => void;
}

export function MaintenanceForm({ vehicles, suppliers, maintenance, onSaved }: MaintenanceFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(maintenance);
  const schema = useMemo(() => createSchema(!isEditing), [isEditing]);

  const initialVehicle = useMemo(() => {
    if (maintenance) return String(maintenance.vehicle?.id ?? "");
    const last = readLastVehicle();
    return vehicles.some((vehicle) => String(vehicle.id) === last) ? last : "";
  }, [vehicles, maintenance]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<MaintenanceValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: maintenance ? toInputDateTime(maintenance.date) : nowInputValue(),
      supplier_id: maintenance ? String(maintenance.supplier?.id ?? "") : "",
      vehicle_id: initialVehicle,
      km: maintenance ? String(maintenance.km_current ?? "") : "",
      km_after: maintenance?.km_after !== null && maintenance?.km_after !== undefined ? String(maintenance.km_after) : "",
      next_maintenance_date: maintenance ? toInputDate(maintenance.next_maintenance_date) : "",
      invoice_number: maintenance?.invoice_number ?? "",
      price: maintenance ? String(maintenance.price) : "",
      notes: maintenance?.notes ?? "",
      attachment: undefined,
    },
  });

  const vehicleId = useWatch({ control, name: "vehicle_id" });
  const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === vehicleId);

  useEffect(() => {
    if (!isEditing && selectedVehicle?.maintenance_km !== null && selectedVehicle?.maintenance_km !== undefined) {
      setValue("km", String(selectedVehicle.maintenance_km));
    }
  }, [isEditing, selectedVehicle, setValue]);

  const supplierOptions = useMemo(
    () => suppliers.map((supplier) => ({ value: String(supplier.id), label: supplier.name })),
    [suppliers],
  );

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEditing
        ? apiFetch<Maintenance>(`/maintenances/${maintenance!.id}`, { method: "PUT", body: data })
        : apiFetch<Maintenance>("/maintenances", { method: "POST", body: data }),
    onSuccess: async (_result, data) => {
      saveLastVehicle(String(data.get("vehicle_id") ?? ""));
      await Promise.all(
        ["maintenances", "vehicles"].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
      );
      toast.success(isEditing ? "Manutenzione aggiornata." : "Manutenzione salvata.");
      onSaved();
    },
  });

  async function onSubmit(values: MaintenanceValues) {
    const data = new FormData();
    data.append("vehicle_id", values.vehicle_id);
    data.append("supplier_id", values.supplier_id);
    data.append("date", values.date);
    data.append("km", values.km);
    appendOptional(data, "km_after", values.km_after);
    appendOptional(data, "next_maintenance_date", values.next_maintenance_date);
    data.append("price", String(parseDecimal(values.price)));
    data.append("invoice_number", values.invoice_number.trim());
    data.append("notes", values.notes.trim());
    if (values.attachment) data.append("attachment", values.attachment);

    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      handleSubmitError(error, setError);
    }
  }

  const pending = mutation.isPending;
  const lastKm = selectedVehicle?.maintenance_km;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field id="date" label="Data e ora" error={errors.date?.message}>
        <Input
          id="date"
          type="datetime-local"
          className="h-11"
          aria-invalid={Boolean(errors.date)}
          disabled={pending}
          {...register("date")}
        />
      </Field>

      <Field id="supplier_id" label="Fornitore" error={errors.supplier_id?.message}>
        <Controller
          control={control}
          name="supplier_id"
          render={({ field }) => (
            <SearchableSelect
              id="supplier_id"
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              options={supplierOptions}
              placeholder="Seleziona fornitore"
              searchPlaceholder="Cerca fornitore"
              invalid={Boolean(errors.supplier_id)}
              disabled={pending}
            />
          )}
        />
      </Field>

      <Controller
        control={control}
        name="vehicle_id"
        render={({ field }) => (
          <VehicleSelectField
            id="vehicle_id"
            label="Veicolo"
            ref={field.ref}
            value={field.value}
            onChange={field.onChange}
            vehicles={vehicles}
            error={errors.vehicle_id?.message}
            disabled={pending}
          />
        )}
      />

      <Field id="km" label="Km manutenzione" error={errors.km?.message}>
        <Input
          id="km"
          inputMode="numeric"
          className="h-11"
          aria-invalid={Boolean(errors.km)}
          disabled={pending}
          {...register("km")}
        />
      </Field>

      <Field
        id="km_after"
        label="Prossima manutenzione (km)"
        optional
        error={errors.km_after?.message}
        hint={lastKm !== null && lastKm !== undefined ? `Ultimi km manutenzione: ${formatNumber(lastKm)}` : undefined}
      >
        <Input
          id="km_after"
          inputMode="numeric"
          className="h-11"
          aria-invalid={Boolean(errors.km_after)}
          disabled={pending}
          {...register("km_after")}
        />
      </Field>

      <Field
        id="next_maintenance_date"
        label="Prossima manutenzione (data)"
        optional
        error={errors.next_maintenance_date?.message}
      >
        <Input
          id="next_maintenance_date"
          type="date"
          className="h-11"
          aria-invalid={Boolean(errors.next_maintenance_date)}
          disabled={pending}
          {...register("next_maintenance_date")}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="invoice_number" label="Numero bolla" error={errors.invoice_number?.message}>
          <Input
            id="invoice_number"
            className="h-11"
            aria-invalid={Boolean(errors.invoice_number)}
            disabled={pending}
            {...register("invoice_number")}
          />
        </Field>
        <Field id="price" label="Prezzo (€)" error={errors.price?.message}>
          <Input
            id="price"
            inputMode="decimal"
            className="h-11"
            aria-invalid={Boolean(errors.price)}
            disabled={pending}
            {...register("price")}
          />
        </Field>
      </div>

      <Field id="notes" label="Dettagli intervento" error={errors.notes?.message}>
        <Textarea
          id="notes"
          rows={4}
          className="text-base"
          aria-invalid={Boolean(errors.notes)}
          disabled={pending}
          {...register("notes")}
        />
      </Field>

      <Field id="attachment" label="Allegato" error={errors.attachment?.message}>
        <Controller
          control={control}
          name="attachment"
          render={({ field }) => (
            <FilePicker
              id="attachment"
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              accept="image/*,application/pdf"
              emptyLabel="Scatta o scegli un file"
              existingUrl={maintenance?.attachment_url}
              invalid={Boolean(errors.attachment)}
              disabled={pending}
            />
          )}
        />
      </Field>

      <SubmitButton pending={pending} label={isEditing ? "Salva modifiche" : "Salva manutenzione"} />
    </form>
  );
}
