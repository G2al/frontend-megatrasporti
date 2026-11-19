"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, FileText, Layers, PackageMinus, Paperclip, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { FormSection } from "@/components/shared/form-section";
import { MultiFilePicker } from "@/components/shared/multi-file-picker";
import { NumberStepper } from "@/components/shared/number-stepper";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { VehicleSelectField } from "@/components/shared/vehicle-select-field";
import { readLastVehicle, saveLastVehicle } from "@/hooks/use-last-vehicle";
import { apiFetch } from "@/lib/api";
import { handleSubmitError } from "@/lib/form";
import { nowInputValue, toInputDateTime } from "@/lib/format";
import type { Platform, Trip, Vehicle } from "@/types";

const schema = z.object({
  date: z.string().min(1, "Inserisci data e ora."),
  platform_id: z.string().min(1, "Seleziona una piattaforma."),
  goods_type_id: z.string().min(1, "Seleziona una dicitura."),
  filiale_id: z.string().min(1, "Seleziona una filiale."),
  vehicle_id: z.string().min(1, "Seleziona una targa."),
  delivery_note_number: z
    .string()
    .min(1, "Inserisci il numero di bordero.")
    .regex(/^[0-9-]+$/, "Il bordero può contenere solo cifre e trattini.")
    .max(30, "Massimo 30 caratteri."),
  scarichi: z.string().regex(/^\d*$/, "Solo numeri interi."),
  attachments: z.array(z.instanceof(File)),
});

type TripValues = z.infer<typeof schema>;

interface TripFormProps {
  vehicles: Vehicle[];
  platforms: Platform[];
  trip?: Trip;
  onSaved: () => void;
}

function findFilialePath(platforms: Platform[], filialeId: number | undefined) {
  if (filialeId == null) return { platformId: "", goodsTypeId: "" };
  for (const platform of platforms) {
    for (const goodsType of platform.goods_types) {
      if (goodsType.filiali.some((filiale) => filiale.id === filialeId)) {
        return { platformId: String(platform.id), goodsTypeId: String(goodsType.id) };
      }
    }
  }
  return { platformId: "", goodsTypeId: "" };
}

export function TripForm({ vehicles, platforms, trip, onSaved }: TripFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(trip);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([]);

  const initialVehicle = useMemo(() => {
    if (trip) return String(trip.vehicle?.id ?? "");
    const last = readLastVehicle();
    return vehicles.some((vehicle) => String(vehicle.id) === last) ? last : "";
  }, [vehicles, trip]);

  const initialPath = useMemo(() => findFilialePath(platforms, trip?.filiale?.id), [platforms, trip]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<TripValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: trip ? toInputDateTime(trip.date) : nowInputValue(),
      platform_id: initialPath.platformId,
      goods_type_id: initialPath.goodsTypeId,
      filiale_id: trip ? String(trip.filiale?.id ?? "") : "",
      vehicle_id: initialVehicle,
      delivery_note_number: trip?.delivery_note_number ?? "",
      scarichi: trip?.scarichi != null ? String(trip.scarichi) : "",
      attachments: [],
    },
  });

  const [watchedPlatformId, watchedGoodsTypeId] = useWatch({
    control,
    name: ["platform_id", "goods_type_id"],
  });

  const selectedPlatform = useMemo(
    () => platforms.find((platform) => String(platform.id) === watchedPlatformId),
    [platforms, watchedPlatformId],
  );
  const goodsTypes = useMemo(() => selectedPlatform?.goods_types ?? [], [selectedPlatform]);
  const selectedGoodsType = useMemo(
    () => goodsTypes.find((goodsType) => String(goodsType.id) === watchedGoodsTypeId),
    [goodsTypes, watchedGoodsTypeId],
  );
  const filiali = useMemo(() => selectedGoodsType?.filiali ?? [], [selectedGoodsType]);

  const platformOptions = useMemo(
    () => platforms.map((platform) => ({ value: String(platform.id), label: platform.name })),
    [platforms],
  );
  const goodsTypeOptions = useMemo(
    () => goodsTypes.map((goodsType) => ({ value: String(goodsType.id), label: goodsType.name })),
    [goodsTypes],
  );
  const filialeOptions = useMemo(
    () => filiali.map((filiale) => ({ value: String(filiale.id), label: filiale.name })),
    [filiali],
  );

  const remainingExisting = useMemo(
    () => (trip?.attachments ?? []).filter((item) => !removedAttachmentIds.includes(item.id)),
    [trip, removedAttachmentIds],
  );

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEditing
        ? apiFetch<Trip>(`/trips/${trip!.id}`, { method: "PUT", body: data })
        : apiFetch<Trip>("/trips", { method: "POST", body: data }),
    onSuccess: async (_result, data) => {
      saveLastVehicle(String(data.get("vehicle_id") ?? ""));
      await queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success(isEditing ? "Bordero aggiornato." : "Bordero salvato.");
      onSaved();
    },
  });

  async function onSubmit(values: TripValues) {
    const data = new FormData();
    data.append("date", values.date);
    data.append("filiale_id", values.filiale_id);
    data.append("vehicle_id", values.vehicle_id);
    data.append("delivery_note_number", values.delivery_note_number);
    data.append("scarichi", values.scarichi || "0");
    values.attachments.forEach((file) => data.append("attachments[]", file));
    if (isEditing) {
      removedAttachmentIds.forEach((id) => data.append("remove_attachment_ids[]", String(id)));
    }

    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      handleSubmitError(error, setError);
    }
  }

  const pending = mutation.isPending;

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
                onChange={(value) => {
                  field.onChange(value);
                  setValue("goods_type_id", "");
                  setValue("filiale_id", "");
                }}
                options={platformOptions}
                placeholder="Seleziona piattaforma"
                searchPlaceholder="Cerca piattaforma"
                invalid={Boolean(errors.platform_id)}
                disabled={pending}
              />
            )}
          />
        </Field>

        <Field id="goods_type_id" label="Dicitura" icon={Layers} error={errors.goods_type_id?.message}>
          <Controller
            control={control}
            name="goods_type_id"
            render={({ field }) => (
              <SearchableSelect
                id="goods_type_id"
                ref={field.ref}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("filiale_id", "");
                }}
                options={goodsTypeOptions}
                placeholder={watchedPlatformId ? "Seleziona dicitura" : "Seleziona prima una piattaforma"}
                searchPlaceholder="Cerca dicitura"
                invalid={Boolean(errors.goods_type_id)}
                disabled={pending || !watchedPlatformId}
              />
            )}
          />
        </Field>

        <Field id="filiale_id" label="Filiale" icon={Warehouse} error={errors.filiale_id?.message}>
          <Controller
            control={control}
            name="filiale_id"
            render={({ field }) => (
              <SearchableSelect
                id="filiale_id"
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
                options={filialeOptions}
                placeholder={watchedGoodsTypeId ? "Seleziona filiale" : "Seleziona prima una dicitura"}
                searchPlaceholder="Cerca filiale"
                invalid={Boolean(errors.filiale_id)}
                disabled={pending || !watchedGoodsTypeId}
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

      <FormSection title="Carico e scarichi">
        <Field id="scarichi" label="Scarichi" icon={PackageMinus} error={errors.scarichi?.message}>
          <Controller
            control={control}
            name="scarichi"
            render={({ field }) => (
              <NumberStepper
                id="scarichi"
                value={field.value || "0"}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={pending}
                invalid={Boolean(errors.scarichi)}
              />
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="Bordero e allegati">
        <Field id="delivery_note_number" label="Numero bordero" icon={FileText} error={errors.delivery_note_number?.message}>
          <Controller
            control={control}
            name="delivery_note_number"
            render={({ field }) => (
              <Input
                id="delivery_note_number"
                inputMode="text"
                pattern="[0-9-]*"
                maxLength={30}
                className="h-11"
                aria-invalid={Boolean(errors.delivery_note_number)}
                disabled={pending}
                ref={field.ref}
                name={field.name}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value.replace(/[^0-9-]/g, ""))}
              />
            )}
          />
        </Field>

        <Field id="attachments" label="Allegati" icon={Paperclip} optional error={errors.attachments?.message}>
          <Controller
            control={control}
            name="attachments"
            render={({ field }) => (
              <MultiFilePicker
                id="attachments"
                ref={field.ref}
                files={field.value}
                onFilesChange={field.onChange}
                existing={remainingExisting}
                onRemoveExisting={(id) => setRemovedAttachmentIds((current) => [...current, id])}
                accept="image/*,application/pdf"
                emptyLabel="Scatta o scegli uno o più file"
                invalid={Boolean(errors.attachments)}
                disabled={pending}
              />
            )}
          />
        </Field>
      </FormSection>

      <SubmitButton pending={pending} label={isEditing ? "Salva modifiche" : "Salva bordero"} />
    </form>
  );
}
