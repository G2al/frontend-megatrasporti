"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { apiFetch } from "@/lib/api";
import { handleSubmitError } from "@/lib/form";
import type { Station, StationCard } from "@/types";

const schema = z.object({
  number: z.string().trim().min(1, "Inserisci il numero della carta."),
  label: z.string().trim(),
});

type AddCardValues = z.infer<typeof schema>;

interface AddCardInlineProps {
  stationId: number;
  stationName: string;
  onCreated: (card: StationCard) => void;
}

export function AddCardInline({ stationId, stationName, onCreated }: AddCardInlineProps) {
  const [adding, setAdding] = useState(false);
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
      setAdding(false);
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

  if (!adding) {
    return (
      <Button type="button" variant="outline" className="h-11 w-full gap-2" onClick={() => setAdding(true)}>
        <Plus className="size-4" />
        Aggiungi nuova carta
      </Button>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-1 space-y-3 rounded-lg border-l-4 border-primary bg-secondary/60 p-3 duration-200">
      <div className="flex items-center justify-between">
        <p className="truncate text-sm font-semibold">Nuova carta — {stationName}</p>
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

      <Field id="new-card-number" label="Numero carta" error={errors.number?.message}>
        <Input
          id="new-card-number"
          className="h-11"
          disabled={pending}
          aria-invalid={Boolean(errors.number)}
          {...register("number")}
        />
      </Field>

      <Field id="new-card-label" label="Etichetta" optional error={errors.label?.message}>
        <Input
          id="new-card-label"
          placeholder="Es. Carta Mario"
          className="h-11"
          disabled={pending}
          aria-invalid={Boolean(errors.label)}
          {...register("label")}
        />
      </Field>

      <Button type="button" disabled={pending} className="h-11 w-full" onClick={() => void handleSubmit(onSubmit)()}>
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Salvataggio..." : "Aggiungi carta"}
      </Button>
    </div>
  );
}
