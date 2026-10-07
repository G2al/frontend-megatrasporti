"use client";

import { useMemo, useState } from "react";
import { Wrench } from "lucide-react";
import { MaintenanceCard } from "@/components/maintenances/maintenance-card";
import { MaintenanceForm } from "@/components/maintenances/maintenance-form";
import { ListSkeleton } from "@/components/shared/list-states";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { RecordList } from "@/components/shared/record-list";
import { RecordSheet } from "@/components/shared/record-sheet";
import { useAuth } from "@/hooks/use-auth";
import { useMaintenances, useSuppliers, useVehicles } from "@/hooks/use-data";
import { useTabVehicles } from "@/hooks/use-tab-vehicles";
import { canEditRecord } from "@/lib/form";
import { byDateDesc, matchesSearch } from "@/lib/search";
import type { Maintenance } from "@/types";

export default function MaintenancesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Maintenance | null>(null);

  const maintenances = useMaintenances();
  const vehicles = useVehicles();
  const suppliers = useSuppliers();

  const tabVehicles = useTabVehicles(vehicles.data, maintenances.data);

  const filtered = useMemo(
    () =>
      (maintenances.data ?? [])
        .filter((m) => vehicleFilter === "all" || String(m.vehicle?.id) === vehicleFilter)
        .filter((m) =>
          matchesSearch(search, [
            m.invoice_number,
            m.supplier?.name,
            m.vehicle?.plate,
            m.vehicle?.name,
            m.notes,
            m.user?.full_name,
          ]),
        )
        .sort(byDateDesc),
    [maintenances.data, search, vehicleFilter],
  );

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(maintenance: Maintenance) {
    setEditing(maintenance);
    setOpen(true);
  }

  const ready = Boolean(vehicles.data && suppliers.data);

  return (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cerca bolla, fornitore, targa..."
        actionLabel="Nuova manutenzione"
        onAction={openCreate}
        vehicles={tabVehicles}
        vehicleFilter={vehicleFilter}
        onVehicleFilterChange={setVehicleFilter}
      />

      <RecordList
        items={filtered}
        total={maintenances.data?.length ?? 0}
        isPending={maintenances.isPending}
        isError={maintenances.isError}
        onRetry={() => void maintenances.refetch()}
        icon={Wrench}
        emptyTitle="Nessuna manutenzione"
        emptyDescription="Registra la prima manutenzione con il pulsante qui sopra."
        render={(maintenance) => (
          <MaintenanceCard
            maintenance={maintenance}
            canEdit={canEditRecord(user, maintenance.user)}
            onEdit={() => openEdit(maintenance)}
          />
        )}
      />

      <RecordSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        title={editing ? "Modifica manutenzione" : "Nuova manutenzione"}
        description={
          editing ? "Aggiorna i dati dell'intervento." : "Compila i dati dell'intervento e allega la bolla."
        }
      >
        {ready ? (
          <MaintenanceForm
            vehicles={vehicles.data!}
            suppliers={suppliers.data!}
            maintenance={editing ?? undefined}
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
