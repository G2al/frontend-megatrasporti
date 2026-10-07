"use client";

import { KeyRound } from "lucide-react";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { BrandLogo } from "@/components/shared/brand-logo";

export function PasswordGate() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo height={56} />
          <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
            <KeyRound className="size-7" aria-hidden />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Cambia la password</h1>
          <p className="text-muted-foreground">
            Per sicurezza, prima di continuare devi impostare una nuova password.
          </p>
        </div>
        <ChangePasswordForm mode="mandatory" onSuccess={() => undefined} />
      </div>
    </div>
  );
}
