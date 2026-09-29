"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, FileText, Folder, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordDialog } from "@/components/documents/password-dialog";
import { ApiError, apiBlob, apiFetch } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DocumentFile, DocumentFolder } from "@/types";

function deliverBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const viewable = blob.type === "application/pdf" || blob.type.startsWith("image/");
  const opened = viewable ? window.open(url, "_blank", "noopener") : null;
  if (!opened) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function FileRow({ file, busy, onOpen }: { file: DocumentFile; busy: boolean; onOpen: () => void }) {
  const opened = file.opened_at !== null;

  return (
    <li className="space-y-3 rounded-lg border bg-background p-3">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" title={file.title}>
            {file.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(file.created_at)} · {formatFileSize(file.file_size)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold",
            opened ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground",
          )}
        >
          {opened ? "Aperto" : "Non aperto"}
        </span>
      </div>
      <Button variant="outline" className="h-11 w-full" disabled={busy} onClick={onOpen}>
        {busy && <Loader2 className="animate-spin" />}
        {busy ? "Apertura..." : "Apri documento"}
      </Button>
    </li>
  );
}

export function FolderList({ folders }: { folders: DocumentFolder[] }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(folders.length === 1 ? [folders[0].id] : []));
  const [pendingFile, setPendingFile] = useState<DocumentFile | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function toggle(id: number) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function download(file: DocumentFile, password?: string) {
    const blob = await apiBlob(`/documents/files/${file.id}/download`, {
      headers: password ? { "X-Document-Password": password } : undefined,
    });
    deliverBlob(blob, file.title);
  }

  async function openFile(file: DocumentFile, password?: string) {
    setBusyId(file.id);
    setPasswordError(null);
    try {
      if (password) {
        await apiFetch(`/documents/files/${file.id}/open`, { method: "POST", body: { password } });
      }
      await download(file, password);
      setPendingFile(null);
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && password) {
        setPasswordError(error.firstMessage());
      } else {
        setPendingFile(null);
        toast.error(error instanceof ApiError ? error.firstMessage() : "Impossibile aprire il documento.");
      }
    } finally {
      setBusyId(null);
    }
  }

  function requestOpen(file: DocumentFile) {
    if (file.opened_at === null) {
      setPasswordError(null);
      setPendingFile(file);
    } else {
      void openFile(file);
    }
  }

  return (
    <>
      <ul className="space-y-3">
        {folders.map((folder) => {
          const isOpen = expanded.has(folder.id);
          const panelId = `folder-panel-${folder.id}`;
          return (
            <li key={folder.id} className="overflow-hidden rounded-xl border bg-card">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(folder.id)}
                  className="flex min-h-14 w-full items-center gap-3 px-4 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset"
                >
                  <Folder className="size-5 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{folder.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {folder.files.length === 1 ? "1 file" : `${folder.files.length} file`}
                    </span>
                  </span>
                  <ChevronDown className={cn("size-5 shrink-0 transition-transform", isOpen && "rotate-180")} aria-hidden />
                </button>
              </h3>
              {isOpen && (
                <div id={panelId} className="border-t bg-muted/30 p-3">
                  {folder.files.length === 0 ? (
                    <p className="py-2 text-center text-sm text-muted-foreground">Nessun file in questa cartella.</p>
                  ) : (
                    <ul className="space-y-2">
                      {folder.files.map((file) => (
                        <FileRow
                          key={file.id}
                          file={file}
                          busy={busyId === file.id && pendingFile === null}
                          onOpen={() => requestOpen(file)}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <PasswordDialog
        key={pendingFile?.id ?? "closed"}
        open={pendingFile !== null}
        fileTitle={pendingFile?.title ?? ""}
        error={passwordError}
        pending={busyId !== null && pendingFile !== null}
        onSubmit={(password) => pendingFile && void openFile(pendingFile, password)}
        onClose={() => setPendingFile(null)}
      />
    </>
  );
}
