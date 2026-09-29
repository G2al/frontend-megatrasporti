"use client";

import { cn } from "@/lib/utils";

interface SwitchRowProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SwitchRow({ id, label, checked, onChange }: SwitchRowProps) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3">
      <label htmlFor={id} className="flex-1 py-2 text-sm font-medium">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          checked ? "bg-primary" : "bg-muted-foreground/40",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
