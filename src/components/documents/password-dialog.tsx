"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/shared/field";
import { PasswordInput } from "@/components/shared/password-input";

interface PasswordDialogProps {
  open: boolean;
  fileTitle: string;
  error: string | null;
  pending: boolean;
  onSubmit: (password: string) => void;
  onClose: () => void;
}

export function PasswordDialog({ open, fileTitle, error, pending, onSubmit, onClose }: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next && !pending) {
      setPassword("");
      setTouched(false);
      onClose();
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (password.length === 0 || pending) return;
    onSubmit(password);
  }

  const fieldError = error ?? (touched && password.length === 0 ? "Inserisci la password del tuo account." : undefined);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] sm:max-w-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle>Apri documento</DialogTitle>
            <DialogDescription className="break-words">
              Alla prima apertura di «{fileTitle}» serve la password del tuo account.
            </DialogDescription>
          </DialogHeader>

          <Field id="document-password" label="Password account" error={fieldError}>
            <PasswordInput
              id="document-password"
              autoComplete="current-password"
              autoFocus
              value={password}
              disabled={pending}
              aria-invalid={Boolean(fieldError)}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="h-11" disabled={pending} onClick={() => handleOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" className="h-11" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "Apertura..." : "Apri"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
