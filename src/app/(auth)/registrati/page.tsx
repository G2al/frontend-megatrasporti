"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { brand } from "@/config/brand";
import { apiFetch } from "@/lib/api";
import { handleSubmitError } from "@/lib/form";

const schema = z
  .object({
    name: z.string().trim().min(1, "Inserisci il nome."),
    surname: z.string().trim().min(1, "Inserisci il cognome."),
    phone: z.string().trim().min(1, "Inserisci il numero di telefono."),
    password: z.string().min(5, "La password deve avere almeno 5 caratteri."),
    password_confirmation: z.string().min(1, "Conferma la password."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Le password non coincidono.",
  });

type RegisterValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", surname: "", phone: "", password: "", password_confirmation: "" },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      const result = await apiFetch<{ message?: string }>("/auth/register", {
        method: "POST",
        body: values,
      });
      setSuccessMessage(
        result?.message ?? "Registrazione completata. Attendi l'approvazione dell'amministratore.",
      );
    } catch (error) {
      handleSubmitError(error, setError);
    }
  }

  if (successMessage) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <BrandLogo height={64} />
          <CheckCircle2 className="size-14 text-green-600" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight">Registrazione inviata</h1>
          <p role="status" className="text-muted-foreground">
            {successMessage}
          </p>
        </div>
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

        <Field id="password" label="Password" error={errors.password?.message} hint="Almeno 5 caratteri">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <Field id="password_confirmation" label="Conferma password" error={errors.password_confirmation?.message}>
          <PasswordInput
            id="password_confirmation"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password_confirmation)}
            {...register("password_confirmation")}
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
