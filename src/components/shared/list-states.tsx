import type { ComponentType } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Caricamento">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3 rounded-xl border p-4">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-1/3" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon className="size-7" aria-hidden />
      </div>
      <p className="font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
    >
      <AlertCircle className="size-8 text-destructive" aria-hidden />
      <p className="text-sm font-medium">{message}</p>
      <Button variant="outline" className="h-11 px-5" onClick={onRetry}>
        Riprova
      </Button>
    </div>
  );
}
