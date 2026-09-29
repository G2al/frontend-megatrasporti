import { Paperclip } from "lucide-react";

interface AttachmentLinkProps {
  href: string | null;
  label: string;
}

export function AttachmentLink({ href, label }: AttachmentLinkProps) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Paperclip className="size-4" aria-hidden />
      {label}
    </a>
  );
}
