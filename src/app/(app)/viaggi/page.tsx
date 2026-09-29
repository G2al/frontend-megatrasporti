"use client";

import { useMemo, useState } from "react";
import { Truck } from "lucide-react";
import { ListSkeleton } from "@/components/shared/list-states";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { RecordList } from "@/components/shared/record-list";
import { RecordSheet } from "@/components/shared/record-sheet";
import { TripCard } from "@/components/trips/trip-card";
import { TripForm } from "@/components/trips/trip-form";
import { usePlatforms, useTrips, useVehicles } from "@/hooks/use-data";
import { useTabVehicles } from "@/hooks/use-tab-vehicles";
import { byDateDesc, matchesSearch } from "@/lib/search";

export default function TripsPage() {
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cerca bolla, destinazione, targa..."
        actionLabel="Nuovo viaggio"
        onAction={() => setOpen(true)}
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
        render={(trip) => <TripCard trip={trip} />}
      />

      <RecordSheet
        open={open}
        onOpenChange={setOpen}
        title="Nuovo viaggio"
        description="Compila i dati del viaggio e allega la bolla."
      >
        {vehicles.data && platforms.data ? (
          <TripForm vehicles={vehicles.data} platforms={platforms.data} onSaved={() => setOpen(false)} />
        ) : (
          <ListSkeleton count={2} />
        )}
      </RecordSheet>
    </>
  );
}
