"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  min?: number;
  disabled?: boolean;
  invalid?: boolean;
}

export function NumberStepper({ id, value, onChange, onBlur, min = 0, disabled, invalid }: NumberStepperProps) {
  const current = Number(value) || 0;

  function set(next: number) {
    onChange(String(Math.max(min, next)));
  }

  return (
    <div
      className={cn(
        "flex h-11 items-stretch overflow-hidden rounded-lg border bg-transparent",
        invalid && "border-destructive",
      )}
    >
      <Button
        type="button"
        variant="ghost"
        className="h-full w-11 shrink-0 rounded-none"
        aria-label="Diminuisci"
        disabled={disabled || current <= min}
        onClick={() => set(current - 1)}
      >
        <Minus className="size-4" />
      </Button>
      <input
        id={id}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ""))}
        onBlur={onBlur}
        className="h-full w-full min-w-0 border-x bg-transparent text-center text-base tabular-nums outline-none disabled:opacity-50"
      />
      <Button
        type="button"
        variant="ghost"
        className="h-full w-11 shrink-0 rounded-none"
        aria-label="Aumenta"
        disabled={disabled}
        onClick={() => set(current + 1)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
