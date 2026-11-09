"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { prepareUpload } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types";

interface VerificationFileRowProps {
  label: string;
  fieldName: string;
  existingUrl: string | null;
  onSubmit: (data: FormData) => Promise<VerificationStatus>;
}

export function VerificationFileRow({ label, fieldName, existingUrl, onSubmit }: VerificationFileRowProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const done = Boolean(existingUrl);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const prepared = await prepareUpload(file);
      const data = new FormData();
      data.append(fieldName, prepared);
      await onSubmit(data);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 900);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.firstMessage() : "Impossibile caricare il file.");
    } finally {
      setUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {existingUrl ? (
          <Image src={existingUrl} alt="" fill unoptimized className="object-cover" />
        ) : (
          <Camera className="size-5 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className={cn("text-xs", done ? "text-green-700" : "text-muted-foreground")}>
          {done ? "Caricato" : "Non caricato"}
        </p>
      </div>
      <div className={cn("flex shrink-0 gap-1.5", justSaved && "animate-in zoom-in-50 duration-300")}>
        <Button
          type="button"
          variant={done ? "outline" : "default"}
          size="icon-sm"
          aria-label="Scatta foto"
          disabled={uploading}
          onClick={() => cameraInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : justSaved ? (
            <Check className="size-4" />
          ) : (
            <Camera className="size-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Scegli dalla galleria"
          disabled={uploading}
          onClick={() => galleryInputRef.current?.click()}
        >
          <ImageIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
