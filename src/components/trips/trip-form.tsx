"use client";

import { useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, FileText, Layers, MapPin, Paperclip, Plus, Trash2, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field } from "@/components/shared/field";
import { FilePicker } from "@/components/shared/file-picker";
import { FormSection } from "@/components/shared/form-section";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { VehicleSelectField } from "@/components/shared/vehicle-select-field";
import { readLastVehicle, saveLastVehicle } from "@/hooks/use-last-vehicle";
import { apiFetch } from "@/lib/api";
import { handleSubmitError } from "@/lib/form";
import { nowInputValue, toInputDateTime } from "@/lib/format";
import type { GoodsType, Platform, Trip, Vehicle } from "@/types";

function createSchema(requireAttachment: boolean) {
  return z.object({
    date: z.string().min(1, "Inserisci data e ora."),
    platform_id: z.string().min(1, "Seleziona una piattaforma."),
    vehicle_id: z.string().min(1, "Seleziona una targa."),
    destinations: z
      .array(z.object({ value: z.string().trim().max(255, "Massimo 255 caratteri.") }))
      .refine((items) => items.some((item) => item.value !== ""), "Inserisci almeno una destinazione."),
    goods_type: z.enum(["secco", "freschi"], { message: "Seleziona la dicitura." }),
    delivery_note_number: z
      .string()
      .min(1, "Inserisci il numero di bolla.")
      .regex(/^\d+$/, "La bolla deve contenere solo cifre.")
      .max(30, "Massimo 30 cifre."),
    attachment: requireAttachment
      ? z.instanceof(File, { message: "L'allegato è obbligatorio." })
      : z.instanceof(File).optional(),
  });
}

type TripValues = z.infer<ReturnType<typeof createSchema>>;

const GOODS_OPTIONS: Array<{ value: GoodsType; label: string }> = [
  { value: "secco", label: "Secco" },
  { value: "freschi", label: "Freschi" },
];

interface TripFormProps {
  vehicles: Vehicle[];
  platforms: Platform[];
  trip?: Trip;
  onSaved: () => void;
}

export function TripForm({ vehicles, platforms, trip, onSaved }: TripFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(trip);
  const schema = useMemo(() => createSchema(!isEditing), [isEditing]);

  const initialVehicle = useMemo(() => {
    if (trip) return String(trip.vehicle?.id ?? "");
    const last = readLastVehicle();
    return vehicles.some((vehicle) => String(vehicle.id) === last) ? last : "";
  }, [vehicles, trip]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TripValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: trip ? toInputDateTime(trip.date) : nowInputValue(),
      platform_id: trip ? String(trip.platform?.id ?? "") : "",
      vehicle_id: initialVehicle,
      destinations: trip && trip.destinations.length > 0 ? trip.destinations.map((value) => ({ value })) : [{ value: "" }],
      goods_type: trip?.goods_type,
      delivery_note_number: trip?.delivery_note_number ?? "",
      attachment: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "destinations" });

  const platformOptions = useMemo(
    () => platforms.map((platform) => ({ value: String(platform.id), label: platform.name })),
    [platforms],
  );

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEditing
        ? apiFetch<Trip>(`/trips/${trip!.id}`, { method: "PUT", body: data })
        : apiFetch<Trip>("/trips", { method: "POST", body: data }),
    onSuccess: async (_result, data) => {
      saveLastVehicle(String(data.get("vehicle_id") ?? ""));
      await queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success(isEditing ? "Viaggio aggiornato." : "Viaggio salvato.");
      onSaved();
    },
  });

  async function onSubmit(values: TripValues) {
    const data = new FormData();
    data.append("date", values.date);
    data.append("platform_id", values.platform_id);
    data.append("vehicle_id", values.vehicle_id);
    values.destinations
      .map((item) => item.value.trim())
      .filter((value) => value !== "")
      .forEach((value) => data.append("destinations[]", value));
    if (values.goods_type) data.append("goods_type", values.goods_type);
    data.append("delivery_note_number", values.delivery_note_number);
    if (values.attachment) data.append("attachment", values.attachment);

    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      handleSubmitError(error, setError);
    }
  }

  const pending = mutation.isPending;
  const destinationsError =
    errors.destinations?.root?.message ??
    errors.destinations?.message ??
    errors.destinations?.find?.((item) => item?.value)?.value?.message;

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

        <Controller
          control={control}
          name="vehicle_id"
          render={({ field }) => (
            <VehicleSelectField
              id="vehicle_id"
              label="Targa"
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              vehicles={vehicles}
              error={errors.vehicle_id?.message}
              disabled={pending}
            />
          )}
        />
      </FormSection>

      <FormSection title="Destinazioni e carico">
        <fieldset className="space-y-2">
          <legend className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            Destinazioni
          </legend>
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                aria-label={`Destinazione ${index + 1}`}
                placeholder={`Destinazione ${index + 1}`}
                maxLength={255}
                className="flex h-11 items-center py-0 leading-normal"
                disabled={pending}
                aria-invalid={Boolean(errors.destinations?.[index]?.value)}
                {...register(`destinations.${index}.value`)}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="size-11 shrink-0"
                  aria-label={`Rimuovi destinazione ${index + 1}`}
                  disabled={pending}
                  onClick={() => remove(index)}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          ))}
          {destinationsError && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {destinationsError}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2"
            disabled={pending}
            onClick={() => append({ value: "" })}
          >
            <Plus />
            Aggiungi destinazione
          </Button>
        </fieldset>

        <Field id="goods_type" label="Dicitura" icon={Layers} error={errors.goods_type?.message}>
          <Controller
            control={control}
            name="goods_type"
            render={({ field }) => (
              <RadioGroup
                id="goods_type"
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value)}
                aria-label="Dicitura"
                className="grid-cols-2"
                disabled={pending}
              >
                {GOODS_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-base has-data-checked:border-primary has-data-checked:bg-secondary"
                  >
                    <RadioGroupItem value={option.value} ref={field.ref} />
                    {option.label}
                  </label>
                ))}
              </RadioGroup>
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="Bolla e allegato">
        <Field id="delivery_note_number" label="Bolla" icon={FileText} error={errors.delivery_note_number?.message}>
          <Controller
            control={control}
            name="delivery_note_number"
            render={({ field }) => (
              <Input
                id="delivery_note_number"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={30}
                className="h-11"
                aria-invalid={Boolean(errors.delivery_note_number)}
                disabled={pending}
                ref={field.ref}
                name={field.name}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ""))}
              />
            )}
          />
        </Field>

        <Field id="attachment" label="Allegato" icon={Paperclip} error={errors.attachment?.message}>
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
                existingUrl={trip?.attachment_url}
                invalid={Boolean(errors.attachment)}
                disabled={pending}
              />
            )}
          />
        </Field>
      </FormSection>

      <SubmitButton pending={pending} label={isEditing ? "Salva modifiche" : "Salva viaggio"} />
    </form>
  );
}
