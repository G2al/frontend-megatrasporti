"use client";

import { VerificationFileRow } from "@/components/profile/verification-file-row";
import { VerificationTextField } from "@/components/profile/verification-text-field";
import type { VerificationStatus } from "@/types";

interface VerificationFieldsProps {
  status: VerificationStatus;
  onSubmit: (data: FormData) => Promise<VerificationStatus>;
  showExpiryStatus?: boolean;
}

export function VerificationFields({ status, onSubmit, showExpiryStatus }: VerificationFieldsProps) {
  const identityReady = Boolean(status.identity_front_url && status.identity_back_url);
  const licenseReady = Boolean(status.license_url && status.license_back_url);
  const cqcReady = Boolean(status.cqc_url && status.cqc_back_url);
  const tachographReady = Boolean(status.tachograph_front_url && status.tachograph_back_url);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Indirizzo</h2>
        <VerificationTextField
          id="address"
          label="Indirizzo di residenza"
          fieldName="address"
          value={status.address}
          onSubmit={onSubmit}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Documento d&apos;identità</h2>
        <VerificationFileRow label="Fronte" fieldName="identity_front" existingUrl={status.identity_front_url} onSubmit={onSubmit} />
        <VerificationFileRow label="Retro" fieldName="identity_back" existingUrl={status.identity_back_url} onSubmit={onSubmit} />
        <VerificationTextField
          id="identity_expiry_date"
          label="Scadenza documento"
          fieldName="identity_expiry_date"
          type="date"
          value={status.identity_expiry_date}
          onSubmit={onSubmit}
          disabled={!identityReady}
          disabledHint="Carica prima fronte e retro del documento."
          showExpiryStatus={showExpiryStatus}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Patente</h2>
        <VerificationFileRow label="Fronte" fieldName="license" existingUrl={status.license_url} onSubmit={onSubmit} />
        <VerificationFileRow label="Retro" fieldName="license_back" existingUrl={status.license_back_url} onSubmit={onSubmit} />
        <VerificationTextField
          id="license_expiry_date"
          label="Scadenza patente"
          fieldName="license_expiry_date"
          type="date"
          value={status.license_expiry_date}
          onSubmit={onSubmit}
          disabled={!licenseReady}
          disabledHint="Carica prima fronte e retro della patente."
          showExpiryStatus={showExpiryStatus}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">CQC</h2>
        <VerificationFileRow label="Fronte" fieldName="cqc" existingUrl={status.cqc_url} onSubmit={onSubmit} />
        <VerificationFileRow label="Retro" fieldName="cqc_back" existingUrl={status.cqc_back_url} onSubmit={onSubmit} />
        <VerificationTextField
          id="cqc_expiry_date"
          label="Scadenza CQC"
          fieldName="cqc_expiry_date"
          type="date"
          value={status.cqc_expiry_date}
          onSubmit={onSubmit}
          disabled={!cqcReady}
          disabledHint="Carica prima fronte e retro della CQC."
          showExpiryStatus={showExpiryStatus}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Carta tachigrafica</h2>
        <VerificationFileRow label="Fronte" fieldName="tachograph_front" existingUrl={status.tachograph_front_url} onSubmit={onSubmit} />
        <VerificationFileRow label="Retro" fieldName="tachograph_back" existingUrl={status.tachograph_back_url} onSubmit={onSubmit} />
        <VerificationTextField
          id="tachograph_expiry_date"
          label="Scadenza carta tachigrafica"
          fieldName="tachograph_expiry_date"
          type="date"
          value={status.tachograph_expiry_date}
          onSubmit={onSubmit}
          disabled={!tachographReady}
          disabledHint="Carica prima fronte e retro della carta tachigrafica."
          showExpiryStatus={showExpiryStatus}
        />
      </section>
    </div>
  );
}

export function countCompletedFields(status: VerificationStatus): number {
  return [
    status.address,
    status.identity_front_url,
    status.identity_back_url,
    status.identity_expiry_date,
    status.license_url,
    status.license_back_url,
    status.license_expiry_date,
    status.cqc_url,
    status.cqc_back_url,
    status.cqc_expiry_date,
    status.tachograph_front_url,
    status.tachograph_back_url,
    status.tachograph_expiry_date,
  ].filter(Boolean).length;
}

export const TOTAL_VERIFICATION_FIELDS = 13;
