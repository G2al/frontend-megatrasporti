"use client";

import type { ReactNode } from "react";
import type { ComponentType } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/list-states";

interface RecordListProps<T extends { id: number }> {
  items: T[] | undefined;
  total: number;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  icon: ComponentType<{ className?: string }>;
  emptyTitle: string;
  emptyDescription: string;
  render: (item: T) => ReactNode;
}

export function RecordList<T extends { id: number }>({
  items,
  total,
  isPending,
  isError,
  onRetry,
  icon,
  emptyTitle,
  emptyDescription,
  render,
}: RecordListProps<T>) {
  if (isPending) return <ListSkeleton />;
  if (isError) return <ErrorState message="Impossibile caricare i dati." onRetry={onRetry} />;
  if (!items || items.length === 0) {
    return total === 0 ? (
      <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
    ) : (
      <EmptyState icon={icon} title="Nessun risultato" description="Prova a cambiare la ricerca o il filtro del veicolo." />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>{render(item)}</li>
      ))}
    </ul>
  );
}
