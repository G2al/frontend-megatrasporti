"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { apiFetch } from "@/lib/api";
import { handleSubmitError } from "@/lib/form";
import type { Vehicle } from "@/types";

const schema = z.object({
  name: z.string().trim().min(1, "Inserisci nome o categoria del veicolo."),
  plate: z.string().trim().min(1, "Inserisci la targa."),
  color: z.string().trim(),
});

type AddVehicleValues = z.infer<typeof schema>;

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (vehicle: Vehicle) => void;
}

export function AddVehicleDialog({ open, onOpenChange, onCreated }: AddVehicleDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<AddVehicleValues>({
    resolver: zodResolver(schema),
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
      onOpenChange(false);
      onCreated(vehicle);
    },
  });

  async function onSubmit(values: AddVehicleValues) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      handleSubmitError(error, setError);
    }
  }

  const pending = mutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          onOpenChange(next);
          if (!next) reset();
        }
      }}
    >
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm">
        <form
          onSubmit={(event) => {
            // Impedisce che l'invio di questo mini-form risalga, tramite il React
            // tree del Portal, fino al <form> del rifornimento/manutenzione/viaggio
            // sottostante e ne attivi la validazione.
            event.stopPropagation();
            void handleSubmit(onSubmit)(event);
          }}
          noValidate
          className="space-y-4"
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Truck className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <DialogTitle>Nuovo veicolo</DialogTitle>
                <DialogDescription>Crea un veicolo e selezionalo subito nel form.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Field id="vehicle-name" label="Nome / categoria" error={errors.name?.message}>
            <Input
              id="vehicle-name"
              placeholder="Es. MOTRICE - FRIGO"
              className="h-11"
              disabled={pending}
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </Field>

          <Field id="vehicle-plate" label="Targa" error={errors.plate?.message}>
            <Input
              id="vehicle-plate"
              className="h-11"
              disabled={pending}
              aria-invalid={Boolean(errors.plate)}
              {...register("plate")}
            />
          </Field>

          <Field id="vehicle-color" label="Colore" optional error={errors.color?.message}>
            <Input
              id="vehicle-color"
              className="h-11"
              disabled={pending}
              aria-invalid={Boolean(errors.color)}
              {...register("color")}
            />
          </Field>

          <Button type="submit" disabled={pending} className="h-11 w-full">
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Salvataggio..." : "Aggiungi veicolo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
