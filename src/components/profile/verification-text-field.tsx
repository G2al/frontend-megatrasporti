"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types";

interface VerificationTextFieldProps {
  id: string;
  label: string;
  fieldName: string;
  type?: "text" | "date";
  value: string | null;
  onSubmit: (data: FormData) => Promise<VerificationStatus>;
  disabled?: boolean;
  disabledHint?: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function VerificationTextField({
  id,
  label,
  fieldName,
  type = "text",
  value,
  onSubmit,
  disabled,
  disabledHint,
}: VerificationTextFieldProps) {
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);

  if (value !== previousValue) {
    setPreviousValue(value);
    setDraft(value ?? "");
  }

  async function save(nextValue: string) {
    setSaving(true);
    try {
      const data = new FormData();
      data.append(fieldName, nextValue);
      await onSubmit(data);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 900);
    } catch (error) {
      setDraft(value ?? "");
      toast.error(error instanceof ApiError ? error.firstMessage() : "Impossibile salvare.");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(nextValue: string) {
    setDraft(nextValue);
  }

  function handleBlur() {
    if (type === "date") {
      if (DATE_PATTERN.test(draft) && draft !== value) void save(draft);
      return;
    }
    const trimmed = draft.trim();
    if (trimmed !== "" && trimmed !== value) void save(trimmed);
  }

  const done = Boolean(value) && !saving;

  return (
    <Field id={id} label={label} hint={disabled ? disabledHint : undefined}>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type={type}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
          className="h-11"
          disabled={saving || disabled}
        />
        <span
          aria-hidden
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg border transition-colors",
            done ? "border-green-200 bg-green-100 text-green-700" : "border-input bg-transparent text-muted-foreground",
            justSaved && "animate-in zoom-in-50 duration-300",
          )}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : done ? <Check className="size-4" /> : null}
        </span>
      </div>
    </Field>
  );
}
