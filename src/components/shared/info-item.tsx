import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoItemProps {
  icon: LucideIcon;
  text: string;
  className?: string;
}

export function InfoItem({ icon: Icon, text, className }: InfoItemProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-1.5 text-sm text-foreground/80", className)}>
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      <span className="truncate" title={text}>
        {text}
      </span>
    </div>
  );
}
