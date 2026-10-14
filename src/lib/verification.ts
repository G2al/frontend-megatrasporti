import { differenceInCalendarDays, parseISO } from "date-fns";

export type ExpiryStatus = "expired" | "expiring" | "valid" | "unknown";

export function expiryStatus(date: string | null): ExpiryStatus {
  if (!date) return "unknown";
  const parsed = parseISO(date);
  if (Number.isNaN(parsed.getTime())) return "unknown";
  const days = differenceInCalendarDays(parsed, new Date());
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "valid";
}
