import { AlertTriangle, HelpCircle, Route } from "lucide-react";
import { formatKm } from "@/lib/format";
import type { DistanceStatus } from "@/types";

interface DistanceResultProps {
  status: DistanceStatus;
  km: number | string | null;
  note?: string | null;
  className?: string;
}

export function DistanceResult({ status, km, note, className }: DistanceResultProps) {
  if (status === "unavailable") {
    return (
      <p className={className ? `${className} flex items-center gap-1.5 text-sm text-muted-foreground` : "flex items-center gap-1.5 text-sm text-muted-foreground"}>
        <HelpCircle className="size-4 shrink-0" aria-hidden />
        Km non disponibili
      </p>
    );
  }

  if (status === "estimated") {
    return (
      <p
        className={
          className
            ? `${className} flex items-center gap-1.5 text-sm font-medium text-amber-700`
            : "flex items-center gap-1.5 text-sm font-medium text-amber-700"
        }
        title={note ?? undefined}
      >
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        ~{formatKm(km)} stimati
      </p>
    );
  }

  return (
    <p
      className={
        className
          ? `${className} flex items-center gap-1.5 text-sm font-medium text-primary`
          : "flex items-center gap-1.5 text-sm font-medium text-primary"
      }
    >
      <Route className="size-4 shrink-0" aria-hidden />
      {formatKm(km)}
    </p>
  );
}
