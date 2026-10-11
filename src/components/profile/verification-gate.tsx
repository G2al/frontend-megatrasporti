"use client";

import { FileCheck } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ListSkeleton } from "@/components/shared/list-states";
import { VerificationFileRow } from "@/components/profile/verification-file-row";
import { VerificationTextField } from "@/components/profile/verification-text-field";
import { useSubmitVerificationField, useVerificationStatus } from "@/hooks/use-verification";

const TOTAL_FIELDS = 8;

export function VerificationGate() {
  const status = useVerificationStatus();
  const submit = useSubmitVerificationField();

  const completed = status.data
    ? [
        status.data.address,
        status.data.identity_front_url,
        status.data.identity_back_url,
        status.data.identity_expiry_date,
        status.data.license_url,
        status.data.license_expiry_date,
        status.data.cqc_url,
        status.data.cqc_expiry_date,
      ].filter(Boolean).length
    : 0;

  const identityPhotosReady = Boolean(status.data?.identity_front_url && status.data?.identity_back_url);
  const licensePhotoReady = Boolean(status.data?.license_url);
  const cqcPhotoReady = Boolean(status.data?.cqc_url);

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
            elemento si salva da solo appena lo scegli o lo scrivi.
          </p>
          {status.data && (
            <p className="text-sm font-medium text-primary">{completed} di {TOTAL_FIELDS} completati</p>
          )}
        </div>

        {status.isPending && <ListSkeleton count={3} />}

        {status.data && (
          <div className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Indirizzo</h2>
              <VerificationTextField
                id="address"
                label="Indirizzo di residenza"
                fieldName="address"
                value={status.data.address}
                onSubmit={submit}
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Documento d&apos;identità</h2>
              <VerificationFileRow label="Fronte" fieldName="identity_front" existingUrl={status.data.identity_front_url} onSubmit={submit} />
              <VerificationFileRow label="Retro" fieldName="identity_back" existingUrl={status.data.identity_back_url} onSubmit={submit} />
              <VerificationTextField
                id="identity_expiry_date"
                label="Scadenza documento"
                fieldName="identity_expiry_date"
                type="date"
                value={status.data.identity_expiry_date}
                onSubmit={submit}
                disabled={!identityPhotosReady}
                disabledHint="Carica prima fronte e retro del documento."
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Patente</h2>
              <VerificationFileRow label="Foto patente" fieldName="license" existingUrl={status.data.license_url} onSubmit={submit} />
              <VerificationTextField
                id="license_expiry_date"
                label="Scadenza patente"
                fieldName="license_expiry_date"
                type="date"
                value={status.data.license_expiry_date}
                onSubmit={submit}
                disabled={!licensePhotoReady}
                disabledHint="Carica prima la foto della patente."
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">CQC</h2>
              <VerificationFileRow label="Foto CQC" fieldName="cqc" existingUrl={status.data.cqc_url} onSubmit={submit} />
              <VerificationTextField
                id="cqc_expiry_date"
                label="Scadenza CQC"
                fieldName="cqc_expiry_date"
                type="date"
                value={status.data.cqc_expiry_date}
                onSubmit={submit}
                disabled={!cqcPhotoReady}
                disabledHint="Carica prima la foto della CQC."
              />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
