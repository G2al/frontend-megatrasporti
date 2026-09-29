"use client";

import { FolderOpen } from "lucide-react";
import { FolderList } from "@/components/documents/folder-list";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/list-states";
import { useDocuments } from "@/hooks/use-data";

export default function DocumentsPage() {
  const documents = useDocuments();

  if (documents.isPending) return <ListSkeleton count={2} />;
  if (documents.isError) {
    return <ErrorState message="Impossibile caricare i documenti." onRetry={() => void documents.refetch()} />;
  }
  if (documents.data.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Nessun documento"
        description="Quando l'amministratore caricherà dei documenti per te li troverai qui."
      />
    );
  }

  return <FolderList folders={documents.data} />;
}
