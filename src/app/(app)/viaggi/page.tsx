"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange, Truck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ListSkeleton } from "@/components/shared/list-states";
import { cn } from "@/lib/utils";
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
            t.filiale?.name,
            t.vehicle?.plate,
            t.vehicle?.name,
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
        searchPlaceholder="Cerca bordero, filiale, targa..."
        actionLabel="Nuovo bordero"
        onAction={openCreate}
        vehicles={tabVehicles}
        vehicleFilter={vehicleFilter}
        onVehicleFilterChange={setVehicleFilter}
      />

      <Link href="/viaggi/scheda" className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full gap-2")}>
        <CalendarRange className="size-4" />
        Scheda mensile
      </Link>

      <RecordList
        items={filtered}
        total={trips.data?.length ?? 0}
        isPending={trips.isPending}
        isError={trips.isError}
        onRetry={() => void trips.refetch()}
        icon={Truck}
        emptyTitle="Nessun bordero"
        emptyDescription="Registra il tuo primo bordero con il pulsante qui sopra."
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
        title={editing ? "Modifica bordero" : "Nuovo bordero"}
        description={editing ? "Aggiorna i dati del bordero." : "Compila i dati del bordero e allega il documento."}
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
