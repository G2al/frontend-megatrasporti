"use client";

import { useState } from "react";
import { FileCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/shared/list-states";
import { countCompletedFields, TOTAL_VERIFICATION_FIELDS, VerificationFields } from "@/components/profile/verification-fields";
import { useConfirmVerification, useSubmitVerificationField, useVerificationStatus } from "@/hooks/use-verification";
import { ApiError } from "@/lib/api";

export function VerificationGate() {
  const status = useVerificationStatus();
  const submit = useSubmitVerificationField();
  const confirm = useConfirmVerification();
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const completed = status.data ? countCompletedFields(status.data) : 0;
  const allComplete = completed === TOTAL_VERIFICATION_FIELDS;

  async function handleConfirm() {
    setConfirming(true);
    setConfirmError(null);
    try {
      await confirm();
      toast.success("Documenti confermati.");
    } catch (error) {
      const message = error instanceof ApiError ? error.firstMessage() : "Impossibile confermare i documenti.";
      setConfirmError(message);
      toast.error(message);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="min-h-dvh overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-[480px] space-y-8 px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo height={56} />
          <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
            <FileCheck className="size-7" aria-hidden />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Completa la verifica</h1>
          <p className="text-muted-foreground">
            Per accedere all&apos;app, carica i tuoi documenti. Puoi compilare i campi in qualsiasi ordine: ogni
            elemento si salva da solo appena lo scegli o lo scrivi. Alla fine conferma l&apos;invio.
          </p>
          {status.data && (
            <p className="text-sm font-medium text-primary">{completed} di {TOTAL_VERIFICATION_FIELDS} completati</p>
          )}
        </div>

        {status.isPending && <ListSkeleton count={3} />}

        {status.data && <VerificationFields status={status.data} onSubmit={submit} />}

        {status.data && (
          <div className="space-y-2">
            <Button type="button" className="h-12 w-full gap-2" disabled={!allComplete || confirming} onClick={() => void handleConfirm()}>
              {confirming && <Loader2 className="size-4 animate-spin" />}
              {confirming ? "Conferma in corso..." : "Conferma invio documenti"}
            </Button>
            {!allComplete && (
              <p className="text-center text-xs text-muted-foreground">
                Completa tutti i campi per poter confermare l&apos;invio.
              </p>
            )}
            {confirmError && (
              <p role="alert" className="text-center text-sm font-medium text-destructive">
                {confirmError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
