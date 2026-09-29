"use client";

import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types";

interface VehicleTabsProps {
  vehicles: Vehicle[];
  value: string;
  onChange: (value: string) => void;
}

export function VehicleTabs({ vehicles, value, onChange }: VehicleTabsProps) {
  const items = [{ id: "all", label: "Tutti" }, ...vehicles.map((v) => ({ id: String(v.id), label: v.plate }))];

  return (
    <div
      role="tablist"
      aria-label="Filtra per veicolo"
      className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground active:bg-muted",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
