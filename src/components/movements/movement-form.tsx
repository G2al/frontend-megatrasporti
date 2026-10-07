"use client";

import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Camera, CreditCard, Droplets, Euro, Fuel, Gauge, MapPin, StickyNote, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConsumptionBadge } from "@/components/movements/consumption-badge";
import { AddCardInline } from "@/components/shared/add-card-inline";
import { Field } from "@/components/shared/field";
import { FilePicker } from "@/components/shared/file-picker";
import { FormSection } from "@/components/shared/form-section";
import { SearchableSelect } from "@/components/shared/searchable-select";
import type { SelectOption } from "@/components/shared/searchable-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { SwitchRow } from "@/components/shared/switch-row";
import { VehicleSelectField } from "@/components/shared/vehicle-select-field";
import { readLastVehicle, saveLastVehicle } from "@/hooks/use-last-vehicle";
import { useKmStart } from "@/hooks/use-data";
import { apiFetch } from "@/lib/api";
import { appendOptional, handleSubmitError } from "@/lib/form";
import { formatMoney, formatNumber, nowInputValue, parseDecimal, toInputDateTime, toNumber } from "@/lib/format";
import type { Movement, Platform, Station, Vehicle } from "@/types";

const integer = (label: string) =>
  z.string().trim().min(1, `${label} obbligatori.`).regex(/^\d+$/, `${label}: inserisci solo numeri interi.`);

const decimal = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} obbligatorio.`)
    .refine((value) => Number.isFinite(parseDecimal(value)) && parseDecimal(value) > 0, `${label}: inserisci un numero maggiore di zero.`);

function createSchema(requirePhoto: boolean) {
  return z
    .object({
      date: z.string().min(1, "Inserisci data e ora."),
      station_id: z.string().min(1, "Seleziona una stazione."),
      platform_id: z.string().min(1, "Seleziona una piattaforma."),
      vehicle_id: z.string().min(1, "Seleziona un veicolo."),
      km_start: integer("Km iniziali"),
      km_end: integer("Km finali"),
      liters: decimal("Litri"),
      price: decimal("Prezzo"),
      is_voucher: z.boolean(),
      station_card_id: z.string(),
      adblue: z
        .string()
        .trim()
        .refine((value) => value === "" || (Number.isFinite(parseDecimal(value)) && parseDecimal(value) >= 0), "AdBlue: inserisci un numero valido."),
      notes: z.string(),
      photo: requirePhoto
        ? z.instanceof(File, { message: "La foto della ricevuta è obbligatoria." })
        : z.instanceof(File).optional(),
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
}

function cardLabel(card: { number: string; label: string | null }): string {
  return card.label ? `${card.number} — ${card.label}` : card.number;
}

type MovementValues = z.infer<ReturnType<typeof createSchema>>;

interface MovementFormProps {
  vehicles: Vehicle[];
  stations: Station[];
  platforms: Platform[];
  movement?: Movement;
  onSaved: () => void;
}

export function MovementForm({ vehicles, stations, platforms, movement, onSaved }: MovementFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(movement);

  const schema = useMemo(() => createSchema(!isEditing), [isEditing]);

  const initialVehicle = useMemo(() => {
    if (movement) return String(movement.vehicle?.id ?? "");
    const last = readLastVehicle();
    return vehicles.some((vehicle) => String(vehicle.id) === last) ? last : "";
  }, [vehicles, movement]);

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
      date: movement ? toInputDateTime(movement.date) : nowInputValue(),
      station_id: movement ? String(movement.station?.id ?? "") : "",
      platform_id: movement ? String(movement.platform?.id ?? "") : "",
      vehicle_id: initialVehicle,
      km_start: movement ? String(movement.km_start) : "",
      km_end: movement ? String(movement.km_end) : "",
      liters: movement ? String(movement.liters) : "",
      price: movement ? String(movement.price) : "",
      is_voucher: movement?.is_voucher ?? false,
      station_card_id: movement?.station_card_id ? String(movement.station_card_id) : "",
      adblue: movement?.adblue !== null && movement?.adblue !== undefined ? String(movement.adblue) : "",
      notes: movement?.notes ?? "",
      photo: undefined,
    },
  });

  const [vehicleId, date, stationId, kmStart, kmEnd, liters] = useWatch({
    control,
    name: ["vehicle_id", "date", "station_id", "km_start", "km_end", "liters"],
  });

  const { data: kmStartData } = useKmStart(!isEditing && vehicleId ? Number(vehicleId) : null, date);

  useEffect(() => {
    if (!isEditing && kmStartData?.km_start !== null && kmStartData?.km_start !== undefined) {
      setValue("km_start", String(kmStartData.km_start));
    }
  }, [isEditing, kmStartData, setValue]);

  const station = stations.find((item) => String(item.id) === stationId);

  const previousStationId = useRef(stationId);
  useEffect(() => {
    if (previousStationId.current !== stationId) {
      setValue("is_voucher", false);
      setValue("station_card_id", "");
      previousStationId.current = stationId;
    }
  }, [stationId, setValue]);

  const cardOptions = useMemo<SelectOption[]>(
    () => (station?.cards ?? []).map((card) => ({ value: String(card.id), label: cardLabel(card), keywords: card.number })),
    [station],
  );

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
  const platformOptions = useMemo(
    () => platforms.map((platform) => ({ value: String(platform.id), label: platform.name })),
    [platforms],
  );

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEditing
        ? apiFetch<Movement>(`/movements/${movement!.id}`, { method: "PUT", body: data })
        : apiFetch<Movement>("/movements", { method: "POST", body: data }),
    onSuccess: async (_result, data) => {
      saveLastVehicle(String(data.get("vehicle_id") ?? ""));
      await Promise.all(
        ["movements", "vehicles", "stations"].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
      );
      toast.success(isEditing ? "Rifornimento aggiornato." : "Rifornimento salvato.");
      onSaved();
    },
  });

  async function onSubmit(values: MovementValues) {
    if (station?.uses_credit_cards && values.station_card_id === "") {
      setError("station_card_id", {
        type: "manual",
        message: "Seleziona la carta di credito usata per questo rifornimento.",
      });
      return;
    }

    const data = new FormData();
    data.append("station_id", values.station_id);
    data.append("platform_id", values.platform_id);
    data.append("vehicle_id", values.vehicle_id);
    data.append("date", values.date);
    data.append("km_start", values.km_start);
    data.append("km_end", values.km_end);
    data.append("liters", String(parseDecimal(values.liters)));
    data.append("price", String(parseDecimal(values.price)));
    if (station?.uses_vouchers) data.append("is_voucher", values.is_voucher ? "1" : "0");
    if (station?.uses_credit_cards && values.station_card_id !== "") {
      data.append("station_card_id", values.station_card_id);
    }
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-7">
      <FormSection title="Quando e dove">
        <Field id="date" label="Data e ora" icon={CalendarClock} error={errors.date?.message}>
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
          icon={MapPin}
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

        {station?.uses_credit_cards && (
          <Field id="station_card_id" label="Carta di credito" icon={CreditCard} error={errors.station_card_id?.message}>
            <div className="space-y-2">
              <Controller
                control={control}
                name="station_card_id"
                render={({ field }) => (
                  <SearchableSelect
                    id="station_card_id"
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    options={cardOptions}
                    placeholder="Seleziona carta"
                    searchPlaceholder="Cerca per numero"
                    invalid={Boolean(errors.station_card_id)}
                    disabled={pending}
                  />
                )}
              />
              {station && (
                <AddCardInline
                  stationId={station.id}
                  stationName={station.name}
                  onCreated={(card) => setValue("station_card_id", String(card.id))}
                />
              )}
            </div>
          </Field>
        )}

        <Field id="platform_id" label="Piattaforma" icon={Warehouse} error={errors.platform_id?.message}>
          <Controller
            control={control}
            name="platform_id"
            render={({ field }) => (
              <SearchableSelect
                id="platform_id"
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
                options={platformOptions}
                placeholder="Seleziona piattaforma"
                searchPlaceholder="Cerca piattaforma"
                invalid={Boolean(errors.platform_id)}
                disabled={pending}
              />
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="Veicolo e chilometraggio">
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

        <div className="grid grid-cols-2 gap-3">
          <Field id="km_start" label="Km iniziali" icon={Gauge} error={errors.km_start?.message}>
            <Input
              id="km_start"
              inputMode="numeric"
              className="h-11"
              aria-invalid={Boolean(errors.km_start)}
              disabled={pending}
              {...register("km_start")}
            />
          </Field>
          <Field id="km_end" label="Km finali" icon={Gauge} error={errors.km_end?.message}>
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
      </FormSection>

      <FormSection title="Consumi">
        <div className="grid grid-cols-2 gap-3">
          <Field id="liters" label="Litri" icon={Fuel} error={errors.liters?.message}>
            <Input
              id="liters"
              inputMode="decimal"
              className="h-11"
              aria-invalid={Boolean(errors.liters)}
              disabled={pending}
              {...register("liters")}
            />
          </Field>
          <Field id="price" label="Prezzo (€)" icon={Euro} error={errors.price?.message}>
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

        <Field id="adblue" label="AdBlue" icon={Droplets} optional error={errors.adblue?.message}>
          <Input
            id="adblue"
            inputMode="decimal"
            className="h-11"
            aria-invalid={Boolean(errors.adblue)}
            disabled={pending}
            {...register("adblue")}
          />
        </Field>
      </FormSection>

      <FormSection title="Note e ricevuta">
        <Field id="notes" label="Note" icon={StickyNote} optional error={errors.notes?.message}>
          <Textarea id="notes" rows={3} className="text-base" disabled={pending} {...register("notes")} />
        </Field>

        <Field id="photo" label="Foto ricevuta" icon={Camera} error={errors.photo?.message}>
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
                existingUrl={movement?.photo_url}
                invalid={Boolean(errors.photo)}
                disabled={pending}
              />
            )}
          />
        </Field>
      </FormSection>

      <SubmitButton pending={pending} label={isEditing ? "Salva modifiche" : "Salva rifornimento"} />
    </form>
  );
}
