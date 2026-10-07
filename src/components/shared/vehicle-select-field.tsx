"use client";

import { useMemo, useState, type Ref } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddVehicleDialog } from "@/components/shared/add-vehicle-dialog";
import { Field } from "@/components/shared/field";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { vehicleOptions } from "@/lib/form";
import type { Vehicle } from "@/types";

interface VehicleSelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  vehicles: Vehicle[];
  error?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  ref?: Ref<HTMLSelectElement>;
}

export function VehicleSelectField({
  id,
  label,
  value,
  onChange,
  vehicles,
  error,
  disabled,
  searchPlaceholder = "Cerca per targa o nome",
  ref,
}: VehicleSelectFieldProps) {
  const [addOpen, setAddOpen] = useState(false);
  const options = useMemo(() => vehicleOptions(vehicles), [vehicles]);

  return (
    <Field id={id} label={label} error={error}>
      <div className="space-y-2">
        <SearchableSelect
          id={id}
          ref={ref}
          value={value}
          onChange={onChange}
          options={options}
          placeholder={`Seleziona ${label.toLowerCase()}`}
          searchPlaceholder={searchPlaceholder}
          invalid={Boolean(error)}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2"
          disabled={disabled}
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" />
          Aggiungi nuovo veicolo
        </Button>
      </div>

      <AddVehicleDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(vehicle) => onChange(String(vehicle.id))}
      />
    </Field>
  );
}
