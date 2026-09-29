"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Vehicle } from "@/types";

export function useTabVehicles(
  vehicles: Vehicle[] | undefined,
  records: Array<{ vehicle: { id: number } | null }> | undefined,
): Vehicle[] {
  const { user } = useAuth();

  return useMemo(() => {
    if (!vehicles) return [];
    if (user?.role === "admin") return vehicles;
    const used = new Set(records?.map((record) => record.vehicle?.id));
    return vehicles.filter((vehicle) => used.has(vehicle.id));
  }, [vehicles, records, user?.role]);
}
