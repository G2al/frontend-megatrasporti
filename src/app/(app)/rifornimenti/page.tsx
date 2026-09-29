"use client";

import { useMemo, useState } from "react";
import { PumpIcon } from "@/components/shared/pump-icon";
import { MovementCard } from "@/components/movements/movement-card";
import { MovementForm } from "@/components/movements/movement-form";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { ListSkeleton } from "@/components/shared/list-states";
import { RecordList } from "@/components/shared/record-list";
import { RecordSheet } from "@/components/shared/record-sheet";
import { useMovements, useStations, useVehicles } from "@/hooks/use-data";
import { useTabVehicles } from "@/hooks/use-tab-vehicles";
import { byDateDesc, matchesSearch } from "@/lib/search";

export default function MovementsPage() {
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const movements = useMovements();
  const vehicles = useVehicles();
  const stations = useStations();

  const tabVehicles = useTabVehicles(vehicles.data, movements.data);

  const filtered = useMemo(
    () =>
      (movements.data ?? [])
        .filter((m) => vehicleFilter === "all" || String(m.vehicle?.id) === vehicleFilter)
        .filter((m) =>
          matchesSearch(search, [
            m.station?.name,
            m.vehicle?.plate,
            m.vehicle?.name,
            m.notes,
            m.user?.full_name,
          ]),
        )
        .sort(byDateDesc),
    [movements.data, search, vehicleFilter],
  );

  return (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cerca stazione, targa, note..."
        actionLabel="Nuovo rifornimento"
        onAction={() => setOpen(true)}
        vehicles={tabVehicles}
        vehicleFilter={vehicleFilter}
        onVehicleFilterChange={setVehicleFilter}
      />

      <RecordList
        items={filtered}
        total={movements.data?.length ?? 0}
        isPending={movements.isPending}
        isError={movements.isError}
        onRetry={() => void movements.refetch()}
        icon={PumpIcon}
        emptyTitle="Nessun rifornimento"
        emptyDescription="Registra il tuo primo rifornimento con il pulsante qui sopra."
        render={(movement) => <MovementCard movement={movement} />}
      />

      <RecordSheet
        open={open}
        onOpenChange={setOpen}
        title="Nuovo rifornimento"
        description="Compila i dati e allega la foto della ricevuta."
      >
        {vehicles.data && stations.data ? (
          <MovementForm vehicles={vehicles.data} stations={stations.data} onSaved={() => setOpen(false)} />
        ) : (
          <ListSkeleton count={2} />
        )}
      </RecordSheet>
    </>
  );
}
