"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VehicleTabs } from "@/components/shared/vehicle-tabs";
import type { Vehicle } from "@/types";

interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  actionLabel: string;
  onAction: () => void;
  vehicles: Vehicle[];
  vehicleFilter: string;
  onVehicleFilterChange: (value: string) => void;
}

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  actionLabel,
  onAction,
  vehicles,
  vehicleFilter,
  onVehicleFilterChange,
}: ListToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-11 pl-9"
        />
      </div>
      <Button onClick={onAction} className="h-12 w-full gap-2 text-base font-semibold">
        <Plus />
        {actionLabel}
      </Button>
      <VehicleTabs vehicles={vehicles} value={vehicleFilter} onChange={onVehicleFilterChange} />
    </div>
  );
}
