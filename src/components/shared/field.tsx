import type { ComponentType, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldProps {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ id, label, icon: Icon, error, hint, optional, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium">
        {Icon && <Icon className="size-4 shrink-0 text-primary" aria-hidden />}
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (opzionale)</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
