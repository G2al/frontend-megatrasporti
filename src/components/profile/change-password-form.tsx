"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";
import { SubmitButton } from "@/components/shared/submit-button";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { handleSubmitError } from "@/lib/form";

const schema = z
  .object({
    new_password: z.string().min(5, "La nuova password deve avere almeno 5 caratteri."),
    new_password_confirmation: z.string().min(1, "Conferma la nuova password."),
  })
  .refine((values) => values.new_password === values.new_password_confirmation, {
    path: ["new_password_confirmation"],
    message: "Le password non coincidono.",
  });

type ChangePasswordValues = z.infer<typeof schema>;

interface ChangePasswordFormProps {
  mode: "mandatory" | "voluntary";
  onSuccess: () => void;
}

export function ChangePasswordForm({ mode, onSuccess }: ChangePasswordFormProps) {
  const { updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_password: "", new_password_confirmation: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      apiFetch<void>("/auth/change-password", { method: "POST", body: values }),
    onSuccess: () => {
      updateUser({ must_change_password: false });
      if (mode === "voluntary") toast.success("Password aggiornata.");
      onSuccess();
    },
  });

  async function onSubmit(values: ChangePasswordValues) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      handleSubmitError(error, setError);
    }
  }

  const pending = mutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field id="new_password" label="Nuova password" hint="Almeno 5 caratteri" error={errors.new_password?.message}>
        <PasswordInput
          id="new_password"
          autoComplete="new-password"
          disabled={pending}
          aria-invalid={Boolean(errors.new_password)}
          {...register("new_password")}
        />
      </Field>

      <Field
        id="new_password_confirmation"
        label="Conferma nuova password"
        error={errors.new_password_confirmation?.message}
      >
        <PasswordInput
          id="new_password_confirmation"
          autoComplete="new-password"
          disabled={pending}
          aria-invalid={Boolean(errors.new_password_confirmation)}
          {...register("new_password_confirmation")}
        />
      </Field>

      <SubmitButton pending={pending} label="Invia" />
    </form>
  );
}
