"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConsumptionBadge } from "@/components/movements/consumption-badge";
import { Field } from "@/components/shared/field";
import { FilePicker } from "@/components/shared/file-picker";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { SwitchRow } from "@/components/shared/switch-row";
import { readLastVehicle, saveLastVehicle } from "@/hooks/use-last-vehicle";
import { useKmStart } from "@/hooks/use-data";
import { apiFetch } from "@/lib/api";
import { appendOptional, handleSubmitError, vehicleOptions } from "@/lib/form";
import { formatMoney, formatNumber, nowInputValue, parseDecimal, toNumber } from "@/lib/format";
import type { Movement, Station, Vehicle } from "@/types";

const integer = (label: string) =>
  z.string().trim().min(1, `${label} obbligatori.`).regex(/^\d+$/, `${label}: inserisci solo numeri interi.`);

const decimal = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} obbligatorio.`)
    .refine((value) => Number.isFinite(parseDecimal(value)) && parseDecimal(value) > 0, `${label}: inserisci un numero maggiore di zero.`);

const schema = z
  .object({
    date: z.string().min(1, "Inserisci data e ora."),
    station_id: z.string().min(1, "Seleziona una stazione."),
    vehicle_id: z.string().min(1, "Seleziona un veicolo."),
    km_start: integer("Km iniziali"),
    km_end: integer("Km finali"),
    liters: decimal("Litri"),
    price: decimal("Prezzo"),
    is_voucher: z.boolean(),
    adblue: z
      .string()
      .trim()
      .refine((value) => value === "" || (Number.isFinite(parseDecimal(value)) && parseDecimal(value) >= 0), "AdBlue: inserisci un numero valido."),
    notes: z.string(),
    photo: z.instanceof(File, { message: "La foto della ricevuta è obbligatoria." }),
  })
  .superRefine((values, context) => {
    if (/^\d+$/.test(values.km_start) && /^\d+$/.test(values.km_end) && Number(values.km_end) < Number(values.km_start)) {
      context.addIssue({ code: "custom", path: ["km_end"], message: "I km finali devono essere maggiori o uguali ai km iniziali." });
    }
    const liters = parseDecimal(values.liters);
    const price = parseDecimal(values.price);
    if (Number.isFinite(liters) && Number.isFinite(price) && values.liters && values.price && price <= liters) {
      context.addIssue({ code: "custom", path: ["price"], message: "Il prezzo deve essere maggiore dei litri." });
    }
  });

type MovementValues = z.infer<typeof schema>;

interface MovementFormProps {
  vehicles: Vehicle[];
  stations: Station[];
  onSaved: () => void;
}

export function MovementForm({ vehicles, stations, onSaved }: MovementFormProps) {
  const queryClient = useQueryClient();

  const initialVehicle = useMemo(() => {
    const last = readLastVehicle();
    return vehicles.some((vehicle) => String(vehicle.id) === last) ? last : "";
  }, [vehicles]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<MovementValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: nowInputValue(),
      station_id: "",
      vehicle_id: initialVehicle,
      km_start: "",
      km_end: "",
      liters: "",
      price: "",
      is_voucher: false,
      adblue: "",
      notes: "",
      photo: undefined,
    },
  });

  const [vehicleId, date, stationId, kmStart, kmEnd, liters] = useWatch({
    control,
    name: ["vehicle_id", "date", "station_id", "km_start", "km_end", "liters"],
  });

  const { data: kmStartData } = useKmStart(vehicleId ? Number(vehicleId) : null, date);

  useEffect(() => {
    if (kmStartData?.km_start !== null && kmStartData?.km_start !== undefined) {
      setValue("km_start", String(kmStartData.km_start));
    }
  }, [kmStartData, setValue]);

  const station = stations.find((item) => String(item.id) === stationId);

  useEffect(() => {
    if (!station?.uses_vouchers) setValue("is_voucher", false);
  }, [station, setValue]);

  const ticketAverage = useMemo(() => {
    const start = Number(kmStart);
    const end = Number(kmEnd);
    const l = parseDecimal(liters ?? "");
    if (!/^\d+$/.test(kmStart) || !/^\d+$/.test(kmEnd) || !(l > 0) || end < start) return null;
    return (end - start) / l;
  }, [kmStart, kmEnd, liters]);

  const stationOptions = useMemo(
    () => stations.map((item) => ({ value: String(item.id), label: item.name, keywords: item.address ?? "" })),
    [stations],
  );
  const vehicleSelectOptions = useMemo(() => vehicleOptions(vehicles), [vehicles]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiFetch<Movement>("/movements", { method: "POST", body: data }),
    onSuccess: async (_result, data) => {
      saveLastVehicle(String(data.get("vehicle_id") ?? ""));
      await Promise.all(
        ["movements", "vehicles", "stations"].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
      );
      toast.success("Rifornimento salvato.");
      onSaved();
    },
  });

  async function onSubmit(values: MovementValues) {
    const data = new FormData();
    data.append("station_id", values.station_id);
    data.append("vehicle_id", values.vehicle_id);
    data.append("date", values.date);
    data.append("km_start", values.km_start);
    data.append("km_end", values.km_end);
    data.append("liters", String(parseDecimal(values.liters)));
    data.append("price", String(parseDecimal(values.price)));
    if (station?.uses_vouchers) data.append("is_voucher", values.is_voucher ? "1" : "0");
    if (values.adblue.trim() !== "") data.append("adblue", String(parseDecimal(values.adblue)));
    appendOptional(data, "notes", values.notes);
    if (values.photo) data.append("photo", values.photo);

    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      handleSubmitError(error, setError);
    }
  }

  const pending = mutation.isPending;
  const credit = toNumber(station?.credit_balance);

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

      <Field
        id="station_id"
        label="Stazione"
        error={errors.station_id?.message}
        hint={station && credit !== null ? `Credito residuo: ${formatMoney(credit)}` : undefined}
      >
        <Controller
          control={control}
          name="station_id"
          render={({ field }) => (
            <SearchableSelect
              id="station_id"
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              options={stationOptions}
              placeholder="Seleziona stazione"
              searchPlaceholder="Cerca stazione"
              invalid={Boolean(errors.station_id)}
              disabled={pending}
            />
          )}
        />
      </Field>

      {station?.uses_vouchers && (
        <Controller
          control={control}
          name="is_voucher"
          render={({ field }) => (
            <SwitchRow id="is_voucher" label="Pagamento con buono" checked={field.value} onChange={field.onChange} />
          )}
        />
      )}

      <Field id="vehicle_id" label="Veicolo" error={errors.vehicle_id?.message}>
        <Controller
          control={control}
          name="vehicle_id"
          render={({ field }) => (
            <SearchableSelect
              id="vehicle_id"
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              options={vehicleSelectOptions}
              placeholder="Seleziona veicolo"
              searchPlaceholder="Cerca per targa o nome"
              invalid={Boolean(errors.vehicle_id)}
              disabled={pending}
            />
          )}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="km_start" label="Km iniziali" error={errors.km_start?.message}>
          <Input
            id="km_start"
            inputMode="numeric"
            className="h-11"
            aria-invalid={Boolean(errors.km_start)}
            disabled={pending}
            {...register("km_start")}
          />
        </Field>
        <Field id="km_end" label="Km finali" error={errors.km_end?.message}>
          <Input
            id="km_end"
            inputMode="numeric"
            className="h-11"
            aria-invalid={Boolean(errors.km_end)}
            disabled={pending}
            {...register("km_end")}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field id="liters" label="Litri" error={errors.liters?.message}>
          <Input
            id="liters"
            inputMode="decimal"
            className="h-11"
            aria-invalid={Boolean(errors.liters)}
            disabled={pending}
            {...register("liters")}
          />
        </Field>
        <Field id="price" label="Prezzo totale (€)" error={errors.price?.message}>
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

      <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-2.5">
        <span className="text-sm font-medium text-secondary-foreground">Media ticket</span>
        <span className="flex items-center gap-2">
          {ticketAverage !== null && (
            <span className="text-sm text-muted-foreground">{formatNumber(ticketAverage)} km/L</span>
          )}
          <ConsumptionBadge value={ticketAverage} />
        </span>
      </div>

      <Field id="adblue" label="AdBlue" optional error={errors.adblue?.message}>
        <Input
          id="adblue"
          inputMode="decimal"
          className="h-11"
          aria-invalid={Boolean(errors.adblue)}
          disabled={pending}
          {...register("adblue")}
        />
      </Field>

      <Field id="notes" label="Note" optional error={errors.notes?.message}>
        <Textarea id="notes" rows={3} className="text-base" disabled={pending} {...register("notes")} />
      </Field>

      <Field id="photo" label="Foto ricevuta" error={errors.photo?.message}>
        <Controller
          control={control}
          name="photo"
          render={({ field }) => (
            <FilePicker
              id="photo"
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              accept="image/*"
              emptyLabel="Scatta o scegli una foto"
              invalid={Boolean(errors.photo)}
              disabled={pending}
            />
          )}
        />
      </Field>

      <SubmitButton pending={pending} label="Salva rifornimento" />
    </form>
  );
}
