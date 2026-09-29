import { formatNumber, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ConsumptionBadgeProps {
  value: number | string | null | undefined;
  className?: string;
}

export function ConsumptionBadge({ value, className }: ConsumptionBadgeProps) {
  const n = toNumber(value);
  const tone =
    n === null
      ? "bg-muted text-muted-foreground"
      : n < 3
        ? "bg-red-100 text-red-800"
        : n < 3.5
          ? "bg-yellow-100 text-yellow-900"
          : "bg-green-100 text-green-800";

  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
        tone,
        className,
      )}
    >
      {n === null ? "N/D" : `${formatNumber(n)} km/L`}
    </span>
  );
}
