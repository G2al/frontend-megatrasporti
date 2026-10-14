"use client";

import type { ComponentType } from "react";
import { Check, Gauge, Home, IdCard, ShieldCheck, Truck } from "lucide-react";
import { VerificationFileRow } from "@/components/profile/verification-file-row";
import { VerificationTextField } from "@/components/profile/verification-text-field";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types";

interface VerificationFieldsProps {
  status: VerificationStatus;
  onSubmit: (data: FormData) => Promise<VerificationStatus>;
  showExpiryStatus?: boolean;
}

interface SectionProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  done: number;
  total: number;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, done, total, children }: SectionProps) {
  const complete = done === total;
  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              complete ? "bg-green-100 text-green-700" : "bg-secondary text-primary",
            )}
          >
            <Icon className="size-4.5" />
          </span>
          <h2 className="truncate text-[15px] font-semibold">{title}</h2>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
            complete ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground",
          )}
        >
          {complete ? (
            <>
              <Check className="size-3.5" aria-hidden />
              Completo
            </>
          ) : (
            `${done}/${total}`
          )}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function VerificationFields({ status, onSubmit, showExpiryStatus }: VerificationFieldsProps) {
  const identityReady = Boolean(status.identity_front_url && status.identity_back_url);
  const licenseReady = Boolean(status.license_url && status.license_back_url);
  const cqcReady = Boolean(status.cqc_url && status.cqc_back_url);
  const tachographReady = Boolean(status.tachograph_front_url && status.tachograph_back_url);

  return (
    <div className="space-y-4">
      <Section icon={Home} title="Indirizzo" done={status.address ? 1 : 0} total={1}>
        <VerificationTextField
          id="address"
          label="Indirizzo di residenza"
          fieldName="address"
          value={status.address}
          onSubmit={onSubmit}
        />
      </Section>

      <Section
        icon={IdCard}
        title="Documento d'identità"
        done={[status.identity_front_url, status.identity_back_url, status.identity_expiry_date].filter(Boolean).length}
        total={3}
      >
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
      </Section>

      <Section
        icon={Truck}
        title="Patente"
        done={[status.license_url, status.license_back_url, status.license_expiry_date].filter(Boolean).length}
        total={3}
      >
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
      </Section>

      <Section
        icon={ShieldCheck}
        title="CQC"
        done={[status.cqc_url, status.cqc_back_url, status.cqc_expiry_date].filter(Boolean).length}
        total={3}
      >
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
      </Section>

      <Section
        icon={Gauge}
        title="Carta tachigrafica"
        done={[status.tachograph_front_url, status.tachograph_back_url, status.tachograph_expiry_date].filter(Boolean).length}
        total={3}
      >
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
      </Section>
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
