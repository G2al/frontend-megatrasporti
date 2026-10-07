"use client";

import { useMemo, useState } from "react";
import { PumpIcon } from "@/components/shared/pump-icon";
import { MovementCard } from "@/components/movements/movement-card";
import { MovementForm } from "@/components/movements/movement-form";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { ListSkeleton } from "@/components/shared/list-states";
import { RecordList } from "@/components/shared/record-list";
import { RecordSheet } from "@/components/shared/record-sheet";
import { useAuth } from "@/hooks/use-auth";
import { useMovements, usePlatforms, useStations, useVehicles } from "@/hooks/use-data";
import { useTabVehicles } from "@/hooks/use-tab-vehicles";
import { canEditRecord } from "@/lib/form";
import { byDateDesc, matchesSearch } from "@/lib/search";
import type { Movement } from "@/types";

export default function MovementsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Movement | null>(null);

  const movements = useMovements();
  const vehicles = useVehicles();
  const stations = useStations();
  const platforms = usePlatforms();

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

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(movement: Movement) {
    setEditing(movement);
    setOpen(true);
  }

  const ready = Boolean(vehicles.data && stations.data && platforms.data);

  return (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cerca stazione, targa, note..."
        actionLabel="Nuovo rifornimento"
        onAction={openCreate}
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
        render={(movement) => (
          <MovementCard
            movement={movement}
            canEdit={canEditRecord(user, movement.user)}
            onEdit={() => openEdit(movement)}
          />
        )}
      />

      <RecordSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        title={editing ? "Modifica rifornimento" : "Nuovo rifornimento"}
        description={
          editing
            ? "Aggiorna i dati del rifornimento."
            : "Compila i dati e allega la foto della ricevuta."
        }
      >
        {ready ? (
          <MovementForm
            vehicles={vehicles.data!}
            stations={stations.data!}
            platforms={platforms.data!}
            movement={editing ?? undefined}
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
