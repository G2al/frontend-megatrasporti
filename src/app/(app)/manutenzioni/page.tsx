"use client";

import { useMemo, useState } from "react";
import { Wrench } from "lucide-react";
import { MaintenanceCard } from "@/components/maintenances/maintenance-card";
import { MaintenanceForm } from "@/components/maintenances/maintenance-form";
import { ListSkeleton } from "@/components/shared/list-states";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { RecordList } from "@/components/shared/record-list";
import { RecordSheet } from "@/components/shared/record-sheet";
import { useMaintenances, useSuppliers, useVehicles } from "@/hooks/use-data";
import { useTabVehicles } from "@/hooks/use-tab-vehicles";
import { byDateDesc, matchesSearch } from "@/lib/search";

export default function MaintenancesPage() {
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cerca bolla, fornitore, targa..."
        actionLabel="Nuova manutenzione"
        onAction={() => setOpen(true)}
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
        render={(maintenance) => <MaintenanceCard maintenance={maintenance} />}
      />

      <RecordSheet
        open={open}
        onOpenChange={setOpen}
        title="Nuova manutenzione"
        description="Compila i dati dell'intervento e allega la bolla."
      >
        {vehicles.data && suppliers.data ? (
          <MaintenanceForm vehicles={vehicles.data} suppliers={suppliers.data} onSaved={() => setOpen(false)} />
        ) : (
          <ListSkeleton count={2} />
        )}
      </RecordSheet>
    </>
  );
}
