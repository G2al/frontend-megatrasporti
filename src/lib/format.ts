import { format, isValid, parseISO } from "date-fns";
import { it } from "date-fns/locale";

const moneyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const numberFormatter = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 });
const intFormatter = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });

export function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatMoney(value: number | string | null | undefined): string {
  const n = toNumber(value);
  return n === null ? "—" : moneyFormatter.format(n);
}

export function formatNumber(value: number | string | null | undefined): string {
  const n = toNumber(value);
  return n === null ? "—" : numberFormatter.format(n);
}

export function formatKm(value: number | string | null | undefined): string {
  const n = toNumber(value);
  return n === null ? "—" : `${intFormatter.format(n)} km`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = parseISO(value);
  return isValid(date) ? format(date, "dd/MM/yyyy HH:mm", { locale: it }) : "—";
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = parseISO(value);
  return isValid(date) ? format(date, "dd/MM/yyyy", { locale: it }) : "—";
}

export function nowInputValue(): string {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return "—";
  if (bytes < 1024 * 1024) return `${numberFormatter.format(Math.max(bytes, 1) / 1024)} KB`;
  return `${numberFormatter.format(bytes / (1024 * 1024))} MB`;
}

export function parseDecimal(value: string): number {
  return Number(value.trim().replace(",", "."));
}
