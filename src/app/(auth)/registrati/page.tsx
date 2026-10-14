"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Field } from "@/components/shared/field";
import { brand } from "@/config/brand";
import { apiFetch } from "@/lib/api";
import { handleSubmitError } from "@/lib/form";

const schema = z.object({
  name: z.string().trim().min(1, "Inserisci il nome."),
  surname: z.string().trim().min(1, "Inserisci il cognome."),
  phone: z.string().trim().min(1, "Inserisci il numero di telefono."),
});

type RegisterValues = z.infer<typeof schema>;

interface RegisterResponse {
  message?: string;
  password?: string;
}

export default function RegisterPage() {
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", surname: "", phone: "" },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      const response = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: values,
      });
      setResult(response);
    } catch (error) {
      handleSubmitError(error, setError);
    }
  }

  async function handleCopyPassword() {
    if (!result?.password) return;
    try {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Impossibile copiare la password.");
    }
  }

  if (result) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <BrandLogo height={64} />
          <CheckCircle2 className="size-14 text-green-600" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight">Registrazione inviata</h1>
          <p role="status" className="text-muted-foreground">
            {result.message ?? "Registrazione completata. Attendi l'approvazione dell'amministratore."}
          </p>
        </div>

        {result.password && (
          <div className="space-y-2 rounded-xl border bg-card p-4 text-left shadow-xs">
            <p className="text-sm text-muted-foreground">
              La tua password è stata generata automaticamente. Usala per accedere una volta che il tuo account sarà
              approvato.
            </p>
            <div className="flex items-center gap-2">
              <code className="h-11 flex flex-1 items-center overflow-hidden rounded-lg border bg-secondary px-3 text-base font-semibold break-all">
                {result.password}
              </code>
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0 gap-2"
                onClick={() => void handleCopyPassword()}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copiata" : "Copia"}
              </Button>
            </div>
          </div>
        )}

        <Button render={<Link href="/login" />} nativeButton={false} className="h-12 w-full text-base font-semibold">
          Vai al login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandLogo height={64} />
        <h1 className="text-2xl font-bold tracking-tight">Registrati</h1>
        <p className="text-muted-foreground">
          Registrati a {brand.name} per inviare i rifornimenti.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field id="name" label="Nome" error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="given-name"
              autoCapitalize="words"
              className="h-11"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </Field>
          <Field id="surname" label="Cognome" error={errors.surname?.message}>
            <Input
              id="surname"
              autoComplete="family-name"
              autoCapitalize="words"
              className="h-11"
              aria-invalid={Boolean(errors.surname)}
              {...register("surname")}
            />
          </Field>
        </div>

        <Field id="phone" label="Telefono" error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="h-11"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base font-semibold">
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Registrazione in corso..." : "Registrati"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Hai già un account?{" "}
        <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}
