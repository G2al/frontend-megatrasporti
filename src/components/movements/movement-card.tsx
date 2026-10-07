import { ArrowRight, CreditCard, Droplets, Gauge, MapPin, Pencil, Route, Ticket, Truck, User } from "lucide-react";
import { ConsumptionBadge } from "@/components/movements/consumption-badge";
import { ReceiptThumb } from "@/components/movements/receipt-thumb";
import { AttachmentLink } from "@/components/shared/attachment-link";
import { authorTitle } from "@/components/shared/author-line";
import { Button } from "@/components/ui/button";
import { InfoItem } from "@/components/shared/info-item";
import { formatDateTime, formatKm, formatMoney, formatNumber, toNumber } from "@/lib/format";
import type { Movement } from "@/types";

const PAYMENT_LABEL: Record<"voucher" | "card" | "credit", string> = {
  voucher: "Buono",
  card: "Carta",
  credit: "Credito",
};

interface MovementCardProps {
  movement: Movement;
  canEdit?: boolean;
  onEdit?: () => void;
}

export function MovementCard({ movement, canEdit, onEdit }: MovementCardProps) {
  const adblue = toNumber(movement.adblue);
  const distance = movement.km_end - movement.km_start;
  const paymentKind = movement.is_voucher ? "voucher" : movement.station_card_id !== null ? "card" : "credit";

  return (
    <article className="min-w-0 space-y-3 overflow-hidden rounded-xl border bg-card p-4 shadow-xs">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 text-base font-semibold">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate" title={movement.station?.name}>
              {movement.station?.name ?? "Stazione non indicata"}
            </span>
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{formatDateTime(movement.date)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ConsumptionBadge value={movement.km_per_liter} />
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Modifica rifornimento"
              onClick={onEdit}
            >
              <Pencil className="size-4" />
            </Button>
          )}
        </div>
      </header>

      <div className="flex items-baseline justify-between gap-3 rounded-lg bg-secondary px-3 py-2">
        <p className="text-2xl font-bold tracking-tight text-primary">{formatMoney(movement.price)}</p>
        <p className="text-base font-semibold text-secondary-foreground">{formatNumber(movement.liters)} L</p>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <InfoItem icon={Truck} text={movement.vehicle?.plate ?? "—"} />
        <InfoItem icon={paymentKind === "voucher" ? Ticket : CreditCard} text={PAYMENT_LABEL[paymentKind]} />
        <InfoItem icon={Route} text={`${formatKm(distance)} percorsi`} />
        {adblue !== null && adblue > 0 && <InfoItem icon={Droplets} text={`AdBlue ${formatNumber(adblue)} L`} />}
      </div>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <Gauge className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="font-medium">{formatKm(movement.km_start)}</span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-label="a" />
        <span className="font-medium">{formatKm(movement.km_end)}</span>
      </p>

      {movement.notes && (
        <p className="line-clamp-3 text-sm break-words text-muted-foreground">{movement.notes}</p>
      )}

      <footer className="flex items-center justify-between gap-3 border-t pt-3">
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <User className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate" title={authorTitle(movement.user)}>
            {authorTitle(movement.user)}
          </span>
        </p>
        {movement.photo_url && (
          <div className="flex shrink-0 items-center gap-2">
            <AttachmentLink href={movement.photo_url} label="Ricevuta" />
            <ReceiptThumb src={movement.photo_url} />
          </div>
        )}
      </footer>
    </article>
  );
}
