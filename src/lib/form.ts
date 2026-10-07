import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { Author, User, Vehicle } from "@/types";
import type { SelectOption } from "@/components/shared/searchable-select";

export function handleSubmitError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Record<string, Path<T>> = {},
) {
  if (!(error instanceof ApiError)) {
    toast.error("Si è verificato un errore imprevisto.");
    return;
  }

  let matched = false;
  Object.entries(error.errors).forEach(([field, messages]) => {
    const key = field.replace(/\.\d+$/, "").replace(/\.\d+\./, ".");
    const target = fieldMap[key] ?? (key as Path<T>);
    if (messages[0]) {
      setError(target, { type: "server", message: messages[0] }, { shouldFocus: !matched });
      matched = true;
    }
  });

  toast.error(error.firstMessage());
}

export function vehicleOptions(vehicles: Vehicle[]): SelectOption[] {
  return vehicles.map((vehicle) => ({
    value: String(vehicle.id),
    label: `${vehicle.plate} — ${vehicle.name}`,
    keywords: `${vehicle.plate} ${vehicle.name}`,
  }));
}

export function appendOptional(data: FormData, key: string, value: string | undefined) {
  if (value !== undefined && value.trim() !== "") data.append(key, value.trim());
}

export function canEditRecord(user: User | null, author: Author | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return author?.id === user.id;
}
