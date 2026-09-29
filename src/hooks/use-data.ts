"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, unwrapList } from "@/lib/api";
import type {
  DocumentFolder,
  KmStartResponse,
  Maintenance,
  Movement,
  Platform,
  Station,
  Supplier,
  Trip,
  Vehicle,
} from "@/types";

type ListResponse<T> = T[] | { data: T[] };

const REFERENCE_STALE_MS = 5 * 60 * 1000;

function useList<T>(key: string, path: string, referenceData = false) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => unwrapList(await apiFetch<ListResponse<T>>(path, { query: { per_page: "all" } })),
    staleTime: referenceData ? REFERENCE_STALE_MS : 0,
  });
}

export function useVehicles() {
  return useList<Vehicle>("vehicles", "/vehicles", true);
}

export function useStations() {
  return useList<Station>("stations", "/stations", true);
}

export function useSuppliers() {
  return useList<Supplier>("suppliers", "/suppliers", true);
}

export function usePlatforms() {
  return useList<Platform>("platforms", "/platforms", true);
}

export function useMovements() {
  return useList<Movement>("movements", "/movements");
}

export function useMaintenances() {
  return useList<Maintenance>("maintenances", "/maintenances");
}

export function useTrips() {
  return useList<Trip>("trips", "/trips");
}

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => unwrapList(await apiFetch<ListResponse<DocumentFolder>>("/documents")),
  });
}

export function useKmStart(vehicleId: number | null, date: string) {
  return useQuery({
    queryKey: ["km-start", vehicleId, date],
    enabled: vehicleId !== null && date !== "",
    queryFn: () =>
      apiFetch<KmStartResponse>("/movements/km-start", {
        query: { vehicle_id: vehicleId, date },
      }),
  });
}
