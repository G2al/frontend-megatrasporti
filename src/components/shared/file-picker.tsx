"use client";

import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import Image from "next/image";
import { Camera, FileText, Image as ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/format";
import { prepareUpload } from "@/lib/image";
import { cn } from "@/lib/utils";

interface FilePickerProps {
  id: string;
  value: File | undefined;
  onChange: (file: File | undefined) => void;
  accept: string;
  emptyLabel: string;
  existingUrl?: string | null;
  invalid?: boolean;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function FilePicker({
  id,
  value,
  onChange,
  accept,
  emptyLabel,
  existingUrl,
  invalid,
  disabled,
  ref,
}: FilePickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const isImageAccept = accept.includes("image/");

  const previewUrl = useMemo(
    () => (value && value.type.startsWith("image/") ? URL.createObjectURL(value) : null),
    [value],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setProcessing(true);
    try {
      onChange(await prepareUpload(file));
    } catch (error) {
      onChange(undefined);
      toast.error(error instanceof Error ? error.message : "Impossibile elaborare il file.");
    } finally {
      setProcessing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  const showingExisting = !value && Boolean(existingUrl);
  const isImagePreview = value ? value.type.startsWith("image/") : showingExisting;

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
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      )}
      <input
        ref={galleryInputRef}
        type="file"
        accept={accept}
        tabIndex={-1}
        className="sr-only"
        aria-hidden
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      {(value || showingExisting) && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-2">
          <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background">
            {isImagePreview ? (
              <Image
                src={value ? (previewUrl ?? "") : (existingUrl ?? "")}
                alt="Anteprima"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <FileText className="size-7 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value ? value.name : "File attuale"}</p>
            <p className="text-xs text-muted-foreground">
              {value ? formatFileSize(value.size) : "Lascialo invariato o scegline uno nuovo"}
            </p>
          </div>
          {value && (
            <Button
              type="button"
              variant="ghost"
              className="size-11"
              aria-label="Rimuovi file"
              disabled={disabled}
              onClick={() => onChange(undefined)}
            >
              <X />
            </Button>
          )}
        </div>
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
            <ImageIcon />
            Galleria
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
          {processing ? <Loader2 className="animate-spin" /> : <Camera />}
          {processing ? "Elaborazione..." : value || showingExisting ? "Cambia file" : emptyLabel}
        </Button>
      )}
    </div>
  );
}
