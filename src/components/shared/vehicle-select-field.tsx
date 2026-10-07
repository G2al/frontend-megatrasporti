"use client";

import { useMemo, useState, type Ref } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { apiFetch } from "@/lib/api";
import { handleSubmitError, vehicleOptions } from "@/lib/form";
import type { Vehicle } from "@/types";

const addVehicleSchema = z.object({
  name: z.string().trim().min(1, "Inserisci nome o categoria del veicolo."),
  plate: z.string().trim().min(1, "Inserisci la targa."),
  color: z.string().trim(),
});

type AddVehicleValues = z.infer<typeof addVehicleSchema>;

interface VehicleSelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  vehicles: Vehicle[];
  error?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  ref?: Ref<HTMLInputElement>;
}

export function VehicleSelectField({
  id,
  label,
  value,
  onChange,
  vehicles,
  error,
  disabled,
  searchPlaceholder = "Cerca per targa o nome",
  ref,
}: VehicleSelectFieldProps) {
  const [adding, setAdding] = useState(false);
  const options = useMemo(() => vehicleOptions(vehicles), [vehicles]);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<AddVehicleValues>({
    resolver: zodResolver(addVehicleSchema),
    defaultValues: { name: "", plate: "", color: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: AddVehicleValues) =>
      apiFetch<Vehicle>("/vehicles", {
        method: "POST",
        body: { name: values.name.trim(), plate: values.plate.trim(), color: values.color.trim() || undefined },
      }),
    onSuccess: async (vehicle) => {
      queryClient.setQueryData<Vehicle[]>(["vehicles"], (old) => (old ? [...old, vehicle] : [vehicle]));
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Veicolo aggiunto.");
      reset();
      setAdding(false);
      onChange(String(vehicle.id));
    },
  });

  async function onSubmit(values: AddVehicleValues) {
    try {
      await mutation.mutateAsync(values);
    } catch (submitError) {
      handleSubmitError(submitError, setError);
    }
  }

  const pending = mutation.isPending;

  return (
    <Field id={id} label={label} icon={Truck} error={error}>
      <div className="space-y-2">
        <SearchableSelect
          id={id}
          ref={ref}
          value={value}
          onChange={onChange}
          options={options}
          placeholder={`Seleziona ${label.toLowerCase()}`}
          searchPlaceholder={searchPlaceholder}
          invalid={Boolean(error)}
          disabled={disabled}
        />

        {!adding && (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2"
            disabled={disabled}
            onClick={() => setAdding(true)}
          >
            <Plus className="size-4" />
            Aggiungi nuovo veicolo
          </Button>
        )}

        {adding && (
          <div className="animate-in fade-in slide-in-from-top-1 space-y-3 rounded-lg border-l-4 border-primary bg-secondary/60 p-3 duration-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Nuovo veicolo</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Annulla"
                disabled={pending}
                onClick={() => {
                  reset();
                  setAdding(false);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>

            <Field id={`${id}-new-name`} label="Nome / categoria" error={errors.name?.message}>
              <Input
                id={`${id}-new-name`}
                placeholder="Es. MOTRICE - FRIGO"
                className="h-11"
                disabled={pending}
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
            </Field>

            <Field id={`${id}-new-plate`} label="Targa" error={errors.plate?.message}>
              <Input
                id={`${id}-new-plate`}
                className="h-11"
                disabled={pending}
                aria-invalid={Boolean(errors.plate)}
                {...register("plate")}
              />
            </Field>

            <Field id={`${id}-new-color`} label="Colore" optional error={errors.color?.message}>
              <Input
                id={`${id}-new-color`}
                className="h-11"
                disabled={pending}
                aria-invalid={Boolean(errors.color)}
                {...register("color")}
              />
            </Field>

            <Button
              type="button"
              disabled={pending}
              className="h-11 w-full"
              onClick={() => void handleSubmit(onSubmit)()}
            >
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "Salvataggio..." : "Aggiungi veicolo"}
            </Button>
          </div>
        )}
      </div>
    </Field>
  );
}
