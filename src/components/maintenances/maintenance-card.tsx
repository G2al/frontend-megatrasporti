import { CalendarClock, FileText, Gauge, Store, Truck, User } from "lucide-react";
import { AttachmentLink } from "@/components/shared/attachment-link";
import { authorTitle } from "@/components/shared/author-line";
import { InfoItem } from "@/components/shared/info-item";
import { formatDate, formatDateTime, formatKm, formatMoney } from "@/lib/format";
import type { Maintenance } from "@/types";

export function MaintenanceCard({ maintenance }: { maintenance: Maintenance }) {
  const nextParts = [
    maintenance.km_after !== null ? formatKm(maintenance.km_after) : null,
    maintenance.next_maintenance_date ? formatDate(maintenance.next_maintenance_date) : null,
  ].filter(Boolean);

  return (
    <article className="min-w-0 space-y-3 overflow-hidden rounded-xl border bg-card p-4 shadow-xs">
      <header className="min-w-0">
        <h3 className="flex items-center gap-1.5 text-base font-semibold">
          <FileText className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">Bolla {maintenance.invoice_number ?? "—"}</span>
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{formatDateTime(maintenance.date)}</p>
      </header>

      <div className="flex items-baseline justify-between gap-3 rounded-lg bg-secondary px-3 py-2">
        <p className="text-2xl font-bold tracking-tight text-primary">{formatMoney(maintenance.price)}</p>
        <p className="min-w-0 truncate text-sm font-semibold text-secondary-foreground">
          {maintenance.vehicle?.plate ?? "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <InfoItem icon={Store} text={maintenance.supplier?.name ?? "—"} />
        <InfoItem icon={Truck} text={maintenance.vehicle?.name ?? maintenance.vehicle?.plate ?? "—"} />
        <InfoItem icon={Gauge} text={formatKm(maintenance.km_current)} />
        {nextParts.length > 0 && <InfoItem icon={CalendarClock} text={`Prossima: ${nextParts.join(" · ")}`} />}
      </div>

      {maintenance.notes && (
        <p className="line-clamp-4 rounded-lg bg-muted/50 px-3 py-2 text-sm break-words whitespace-pre-line">
          {maintenance.notes}
        </p>
      )}

      <footer className="flex items-center justify-between gap-3 border-t pt-3">
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <User className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate" title={authorTitle(maintenance.user)}>
            {authorTitle(maintenance.user)}
          </span>
        </p>
        <AttachmentLink href={maintenance.attachment_url} label="Allegato" />
      </footer>
    </article>
  );
}
