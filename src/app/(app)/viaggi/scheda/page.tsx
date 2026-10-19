"use client";

import { useState } from "react";
import Link from "next/link";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { ChevronDown, ChevronLeft, ChevronRight, Euro, Truck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorState, ListSkeleton } from "@/components/shared/list-states";
import { TripCard } from "@/components/trips/trip-card";
import { useAuth } from "@/hooks/use-auth";
import { useTripSchedule } from "@/hooks/use-data";
import { canEditRecord } from "@/lib/form";
import { formatDayLabel, formatMonthLabel, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Trip, TripScheduleDay } from "@/types";

function DayRow({ day, canEdit }: { day: TripScheduleDay; canEdit: (trip: Trip) => boolean }) {
  const [open, setOpen] = useState(false);
  const hasTrips = day.trips.length > 0;
  const panelId = `schedule-day-${day.day}`;

  if (!hasTrips) {
    return (
      <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground/70">
        <span className="capitalize">{formatDayLabel(day.date)}</span>
        <span>—</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-14 w-full items-center gap-3 px-4 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset"
      >
        <div className="min-w-0 flex-1">
          <span className="block truncate font-semibold capitalize">{formatDayLabel(day.date)}</span>
          <span className="block text-xs text-muted-foreground">
            {day.trips.length === 1 ? "1 bordero" : `${day.trips.length} bordero`}
            {day.total !== null && ` · ${formatMoney(day.total)}`}
          </span>
        </div>
        <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div id={panelId} className="space-y-3 border-t bg-muted/30 p-3">
          {day.trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} canEdit={canEdit(trip)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripSchedulePage() {
  const { user } = useAuth();
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const monthKey = format(monthDate, "yyyy-MM");

  const schedule = useTripSchedule(monthKey);

  function canEdit(trip: Trip): boolean {
    if (!canEditRecord(user, trip.user)) return false;
    return !trip.is_certified || user?.role === "admin";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/viaggi" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Torna al bordero">
          <ChevronLeft />
        </Link>
        <h1 className="text-lg font-semibold">Scheda mensile</h1>
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-card px-2 py-2">
        <Button variant="ghost" size="icon" aria-label="Mese precedente" onClick={() => setMonthDate((d) => subMonths(d, 1))}>
          <ChevronLeft />
        </Button>
        <span className="text-base font-semibold capitalize">{formatMonthLabel(monthKey)}</span>
        <Button variant="ghost" size="icon" aria-label="Mese successivo" onClick={() => setMonthDate((d) => addMonths(d, 1))}>
          <ChevronRight />
        </Button>
      </div>

      {schedule.isPending && <ListSkeleton count={3} />}
      {schedule.isError && <ErrorState message="Impossibile caricare la scheda mensile." onRetry={() => void schedule.refetch()} />}

      {schedule.data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-xl border bg-card p-3">
              <Truck className="size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Bordero</p>
                <p className="truncate text-lg font-bold">{schedule.data.total_trips}</p>
              </div>
            </div>
            {schedule.data.month_total !== null && (
              <div className="flex items-center gap-2 rounded-xl border bg-card p-3">
                <Euro className="size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Totale mese</p>
                  <p className="truncate text-lg font-bold">{formatMoney(schedule.data.month_total)}</p>
                </div>
              </div>
            )}
          </div>

          {schedule.data.filiale_totals && schedule.data.filiale_totals.length > 0 && (
            <div className="space-y-1.5 rounded-xl border bg-card p-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Per filiale</p>
              {schedule.data.filiale_totals.map((item) => (
                <div key={item.filiale} className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.filiale}</span>
                  <span className="font-medium">{formatMoney(item.total)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {schedule.data.days.map((day) => (
              <DayRow key={day.day} day={day} canEdit={canEdit} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
