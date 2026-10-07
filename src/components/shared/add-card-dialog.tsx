"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { MiniFormDialog } from "@/components/shared/mini-form-dialog";
import { apiFetch } from "@/lib/api";
import { handleSubmitError } from "@/lib/form";
import type { Station, StationCard } from "@/types";

const schema = z.object({
  number: z.string().trim().min(1, "Inserisci il numero della carta."),
  label: z.string().trim(),
});

type AddCardValues = z.infer<typeof schema>;

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stationId: number;
  stationName: string;
  onCreated: (card: StationCard) => void;
}

export function AddCardDialog({ open, onOpenChange, stationId, stationName, onCreated }: AddCardDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<AddCardValues>({
    resolver: zodResolver(schema),
    defaultValues: { number: "", label: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: AddCardValues) =>
      apiFetch<StationCard>(`/stations/${stationId}/cards`, {
        method: "POST",
        body: { number: values.number.trim(), label: values.label.trim() || undefined },
      }),
    onSuccess: async (card) => {
      queryClient.setQueryData<Station[]>(["stations"], (old) =>
        old?.map((item) => (item.id === stationId ? { ...item, cards: [...item.cards, card] } : item)),
      );
      await queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Carta aggiunta.");
      reset();
      onOpenChange(false);
      onCreated(card);
    },
  });

  async function onSubmit(values: AddCardValues) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      handleSubmitError(error, setError);
    }
  }

  const pending = mutation.isPending;

  return (
    <MiniFormDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          onOpenChange(next);
          if (!next) reset();
        }
      }}
      icon={CreditCard}
      title="Nuova carta"
      description={`Aggiungi una carta a ${stationName} e selezionala subito.`}
    >
      <form
        onSubmit={(event) => {
          // Impedisce che l'invio di questo mini-form risalga, tramite il React
          // tree del Portal, fino al <form> del rifornimento sottostante e ne
          // attivi la validazione.
          event.stopPropagation();
          void handleSubmit(onSubmit)(event);
        }}
        noValidate
        className="space-y-4"
      >
        <Field id="card-number" label="Numero carta" error={errors.number?.message}>
          <Input
            id="card-number"
            className="h-11"
            disabled={pending}
            aria-invalid={Boolean(errors.number)}
            {...register("number")}
          />
        </Field>

        <Field id="card-label" label="Etichetta" optional error={errors.label?.message}>
          <Input
            id="card-label"
            placeholder="Es. Carta Mario"
            className="h-11"
            disabled={pending}
            aria-invalid={Boolean(errors.label)}
            {...register("label")}
          />
        </Field>

        <Button type="submit" disabled={pending} className="h-11 w-full">
          {pending && <Loader2 className="animate-spin" />}
          {pending ? "Salvataggio..." : "Aggiungi carta"}
        </Button>
      </form>
    </MiniFormDialog>
  );
}
