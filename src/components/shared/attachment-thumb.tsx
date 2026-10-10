"use client";

import { useState } from "react";
import Image from "next/image";
import { Paperclip } from "lucide-react";

interface AttachmentThumbProps {
  src: string;
  label: string;
}

export function AttachmentThumb({ src, label }: AttachmentThumbProps) {
  const [failed, setFailed] = useState(false);

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {failed ? (
        <Paperclip className="size-5 text-muted-foreground" aria-hidden />
      ) : (
        <Image src={src} alt="" fill unoptimized className="object-cover" onError={() => setFailed(true)} />
      )}
    </a>
  );
}
