"use client";

import { useMemo, useState } from "react";
import { Truck } from "lucide-react";
import { ListSkeleton } from "@/components/shared/list-states";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { RecordList } from "@/components/shared/record-list";
import { RecordSheet } from "@/components/shared/record-sheet";
import { TripCard } from "@/components/trips/trip-card";
import { TripForm } from "@/components/trips/trip-form";
import { useAuth } from "@/hooks/use-auth";
import { usePlatforms, useTrips, useVehicles } from "@/hooks/use-data";
import { useTabVehicles } from "@/hooks/use-tab-vehicles";
import { canEditRecord } from "@/lib/form";
import { byDateDesc, matchesSearch } from "@/lib/search";
import type { Trip } from "@/types";

export default function TripsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);

  const trips = useTrips();
  const vehicles = useVehicles();
  const platforms = usePlatforms();

  const tabVehicles = useTabVehicles(vehicles.data, trips.data);

  const filtered = useMemo(
    () =>
      (trips.data ?? [])
        .filter((t) => vehicleFilter === "all" || String(t.vehicle?.id) === vehicleFilter)
        .filter((t) =>
          matchesSearch(search, [
            t.delivery_note_number,
            t.platform?.name,
            t.vehicle?.plate,
            t.vehicle?.name,
            t.destinations.join(" "),
            t.user?.full_name,
          ]),
        )
        .sort(byDateDesc),
    [trips.data, search, vehicleFilter],
  );

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(trip: Trip) {
    setEditing(trip);
    setOpen(true);
  }

  function canEditTrip(trip: Trip): boolean {
    if (!canEditRecord(user, trip.user)) return false;
    return !trip.is_certified || user?.role === "admin";
  }

  const ready = Boolean(vehicles.data && platforms.data);

  return (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cerca bolla, destinazione, targa..."
        actionLabel="Nuovo viaggio"
        onAction={openCreate}
        vehicles={tabVehicles}
        vehicleFilter={vehicleFilter}
        onVehicleFilterChange={setVehicleFilter}
      />

      <RecordList
        items={filtered}
        total={trips.data?.length ?? 0}
        isPending={trips.isPending}
        isError={trips.isError}
        onRetry={() => void trips.refetch()}
        icon={Truck}
        emptyTitle="Nessun viaggio"
        emptyDescription="Registra il tuo primo viaggio con il pulsante qui sopra."
        render={(trip) => (
          <TripCard trip={trip} canEdit={canEditTrip(trip)} onEdit={() => openEdit(trip)} />
        )}
      />

      <RecordSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        title={editing ? "Modifica viaggio" : "Nuovo viaggio"}
        description={editing ? "Aggiorna i dati del viaggio." : "Compila i dati del viaggio e allega la bolla."}
      >
        {ready ? (
          <TripForm
            vehicles={vehicles.data!}
            platforms={platforms.data!}
            trip={editing ?? undefined}
            onSaved={() => {
              setOpen(false);
              setEditing(null);
            }}
          />
        ) : (
          <ListSkeleton count={2} />
        )}
      </RecordSheet>
    </>
  );
}
