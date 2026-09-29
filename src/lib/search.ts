export function matchesSearch(query: string, parts: Array<string | null | undefined>): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return parts.some((part) => part?.toLowerCase().includes(needle));
}

export function byDateDesc<T extends { date: string }>(a: T, b: T): number {
  return Date.parse(b.date) - Date.parse(a.date);
}
