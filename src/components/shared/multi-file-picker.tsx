"use client";

import { useRef, useState, type Ref } from "react";
import Image from "next/image";
import { Camera, FileText, Loader2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/format";
import { prepareUpload } from "@/lib/image";
import { cn } from "@/lib/utils";

interface ExistingAttachment {
  id: number;
  url: string;
}

interface MultiFilePickerProps {
  id: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  existing: ExistingAttachment[];
  onRemoveExisting: (id: number) => void;
  accept: string;
  emptyLabel: string;
  invalid?: boolean;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

function isImageFile(nameOrUrl: string): boolean {
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(nameOrUrl);
}

export function MultiFilePicker({
  id,
  files,
  onFilesChange,
  existing,
  onRemoveExisting,
  accept,
  emptyLabel,
  invalid,
  disabled,
  ref,
}: MultiFilePickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const isImageAccept = accept.includes("image/");

  async function handleFiles(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    setProcessing(true);
    try {
      const prepared = await Promise.all(Array.from(selected).map((file) => prepareUpload(file)));
      onFilesChange([...files, ...prepared]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossibile elaborare uno dei file.");
    } finally {
      setProcessing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  function removeNewFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  const hasAny = existing.length > 0 || files.length > 0;

  return (
    <div className="space-y-2">
      {isImageAccept && (
        <input
          ref={cameraInputRef}
          type="file"
          accept={accept}
          capture="environment"
          tabIndex={-1}
          className="sr-only"
          aria-hidden
          onChange={(event) => void handleFiles(event.target.files)}
        />
      )}
      <input
        ref={galleryInputRef}
        type="file"
        accept={accept}
        multiple
        tabIndex={-1}
        className="sr-only"
        aria-hidden
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {hasAny && (
        <ul className="space-y-2">
          {existing.map((item) => (
            <li key={`existing-${item.id}`} className="flex items-center gap-3 rounded-lg border bg-muted/40 p-2">
              <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background">
                {isImageFile(item.url) ? (
                  <Image src={item.url} alt="Anteprima" fill unoptimized className="object-cover" />
                ) : (
                  <FileText className="size-6 text-muted-foreground" aria-hidden />
                )}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">Allegato esistente</p>
              <Button
                type="button"
                variant="ghost"
                className="size-11 shrink-0"
                aria-label="Rimuovi allegato"
                disabled={disabled}
                onClick={() => onRemoveExisting(item.id)}
              >
                <X />
              </Button>
            </li>
          ))}
          {files.map((file, index) => {
            const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
            return (
              <li key={`new-${index}`} className="flex items-center gap-3 rounded-lg border bg-muted/40 p-2">
                <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Anteprima" fill unoptimized className="object-cover" />
                  ) : (
                    <FileText className="size-6 text-muted-foreground" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="size-11 shrink-0"
                  aria-label="Rimuovi file"
                  disabled={disabled}
                  onClick={() => removeNewFile(index)}
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {isImageAccept ? (
        <div className="grid grid-cols-2 gap-2">
          <Button
            id={id}
            ref={ref}
            type="button"
            variant="outline"
            disabled={disabled || processing}
            aria-invalid={invalid || undefined}
            onClick={() => cameraInputRef.current?.click()}
            className={cn("h-12 gap-2 text-base", invalid && "border-destructive")}
          >
            {processing ? <Loader2 className="animate-spin" /> : <Camera />}
            {processing ? "Elaborazione..." : "Scatta foto"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || processing}
            onClick={() => galleryInputRef.current?.click()}
            className="h-12 gap-2 text-base"
          >
            <Paperclip />
            {hasAny ? "Aggiungi altro" : "Scegli file"}
          </Button>
        </div>
      ) : (
        <Button
          id={id}
          ref={ref}
          type="button"
          variant="outline"
          disabled={disabled || processing}
          aria-invalid={invalid || undefined}
          onClick={() => galleryInputRef.current?.click()}
          className={cn("h-12 w-full gap-2 text-base", invalid && "border-destructive")}
        >
          {processing ? <Loader2 className="animate-spin" /> : <Paperclip />}
          {processing ? "Elaborazione..." : hasAny ? "Aggiungi altro file" : emptyLabel}
        </Button>
      )}
    </div>
  );
}
