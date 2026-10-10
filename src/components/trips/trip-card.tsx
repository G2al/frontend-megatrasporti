import { Fragment } from "react";
import { ArrowRight, FileText, Layers, Paperclip, Pencil, Truck, User, Warehouse } from "lucide-react";
import { AttachmentThumb } from "@/components/shared/attachment-thumb";
import { authorTitle } from "@/components/shared/author-line";
import { Button } from "@/components/ui/button";
import { DistanceResult } from "@/components/trips/distance-result";
import { InfoItem } from "@/components/shared/info-item";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GoodsType, Trip } from "@/types";

const GOODS_LABELS: Record<GoodsType, string> = {
  secco: "Secco",
  freschi: "Freschi",
};

interface TripCardProps {
  trip: Trip;
  canEdit?: boolean;
  onEdit?: () => void;
}

export function TripCard({ trip, canEdit, onEdit }: TripCardProps) {
  return (
    <article className="min-w-0 space-y-3 overflow-hidden rounded-xl border bg-card p-4 shadow-xs">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 text-base font-semibold">
            <FileText className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">Bolla {trip.delivery_note_number}</span>
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{formatDateTime(trip.date)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
              trip.is_certified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-900",
            )}
          >
            {trip.is_certified ? "Certificato" : "Da certificare"}
          </span>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Modifica viaggio"
              onClick={onEdit}
            >
              <Pencil className="size-4" />
            </Button>
          )}
        </div>
      </header>

      {trip.destinations.length > 0 && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-secondary px-3 py-2 text-base font-semibold text-primary">
          {trip.destinations.map((destination, index) => (
            <Fragment key={`${destination}-${index}`}>
              {index > 0 && <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-label="verso" />}
              <span className="min-w-0 break-words">{destination}</span>
            </Fragment>
          ))}
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <InfoItem icon={Truck} text={trip.vehicle?.plate ?? "—"} />
        <InfoItem icon={Layers} text={GOODS_LABELS[trip.goods_type] ?? trip.goods_type} />
        <InfoItem icon={Warehouse} text={trip.platform?.name ?? "—"} className="col-span-2" />
        {trip.distance_status && (
          <DistanceResult
            status={trip.distance_status}
            km={trip.distance_km}
            note={trip.distance_note}
            className="col-span-2"
          />
        )}
      </div>

      <footer className="space-y-2 border-t pt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <User className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate" title={authorTitle(trip.user)}>
              {authorTitle(trip.user)}
            </span>
          </p>
          {trip.attachments.length > 0 && (
            <p className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="size-3.5 shrink-0" aria-hidden />
              {trip.attachments.length === 1 ? "1 allegato" : `${trip.attachments.length} allegati`}
            </p>
          )}
        </div>
        {trip.attachments.length > 0 && (
          <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
            {trip.attachments.map((attachment, index) => (
              <AttachmentThumb key={attachment.id} src={attachment.url} label={`Apri allegato ${index + 1}`} />
            ))}
          </div>
        )}
      </footer>
    </article>
  );
}
