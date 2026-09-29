"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { brand } from "@/config/brand";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { handleSubmitError } from "@/lib/form";

const schema = z.object({
  full_name: z.string().trim().min(1, "Inserisci nome e cognome o telefono."),
  password: z.string().min(1, "Inserisci la password."),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", password: "", remember: true },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await login(values.full_name, values.password, values.remember);
      router.replace("/rifornimenti");
    } catch (error) {
      if (error instanceof ApiError) setFormError(error.firstMessage());
      handleSubmitError(error, setError);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <BrandLogo height={64} />
        <h1 className="text-2xl font-bold tracking-tight">Accedi a {brand.name}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
          >
            {formError}
          </p>
        )}

        <Field id="full_name" label="Nome e cognome" error={errors.full_name?.message} hint="Oppure il tuo numero di telefono">
          <Input
            id="full_name"
            autoComplete="username"
            autoCapitalize="words"
            className="h-11"
            aria-invalid={Boolean(errors.full_name)}
            {...register("full_name")}
          />
        </Field>

        <Field id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <Controller
          control={control}
          name="remember"
          render={({ field }) => (
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                className="size-5 accent-primary"
              />
              Ricordami
            </label>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base font-semibold">
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Accesso in corso..." : "Accedi"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Nuovo operatore?{" "}
        <Link href="/registrati" className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
          Registrati
        </Link>
      </p>
    </div>
  );
}
