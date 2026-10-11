import { AlertTriangle, CloudOff, MapPinOff, Route, Warehouse } from "lucide-react";
import { formatKm } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DistanceErrorCode, DistanceStatus } from "@/types";

interface DistanceResultProps {
  status: DistanceStatus;
  km: number | string | null;
  note?: string | null;
  errorCode?: DistanceErrorCode | null;
  errorDestination?: string | null;
  className?: string;
}

const ERROR_COPY: Record<DistanceErrorCode, { icon: typeof MapPinOff; title: (destination?: string | null) => string }> = {
  platform_missing_address: { icon: Warehouse, title: () => "Piattaforma senza indirizzo" },
  platform_geocoding_failed: { icon: Warehouse, title: () => "Indirizzo piattaforma non valido" },
  destination_not_found: {
    icon: MapPinOff,
    title: (destination) => (destination ? `Destinazione non trovata: «${destination}»` : "Destinazione non trovata"),
  },
  service_unavailable: { icon: CloudOff, title: () => "Servizio momentaneamente non disponibile" },
  unknown: { icon: CloudOff, title: () => "Km non disponibili" },
};

export function DistanceResult({ status, km, note, errorCode, errorDestination, className }: DistanceResultProps) {
  if (status === "unavailable") {
    const copy = ERROR_COPY[errorCode ?? "unknown"];
    const Icon = copy.icon;
    return (
      <div className={cn("space-y-0.5", className)}>
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Icon className="size-4 shrink-0" aria-hidden />
          {copy.title(errorDestination)}
        </p>
        {note && <p className="pl-5.5 text-xs text-muted-foreground">{note}</p>}
      </div>
    );
  }

  if (status === "estimated") {
    return (
      <div className={cn("space-y-0.5", className)}>
        <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          ~{formatKm(km)} stimati
        </p>
        {note && <p className="pl-5.5 text-xs text-amber-700/80">{note}</p>}
      </div>
    );
  }

  return (
    <p className={cn("flex items-center gap-1.5 text-sm font-medium text-primary", className)}>
      <Route className="size-4 shrink-0" aria-hidden />
      {formatKm(km)}
    </p>
  );
}
