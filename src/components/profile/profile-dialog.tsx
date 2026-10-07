"use client";

import { useState } from "react";
import { ArrowLeft, KeyRound, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { useAuth } from "@/hooks/use-auth";

const ROLE_LABELS: Record<string, string> = {
  worker: "Operaio",
  admin: "Amministratore",
};

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useAuth();
  const [view, setView] = useState<"info" | "password">("info");

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setView("info");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-sm">
        {view === "info" ? (
          <>
            <DialogHeader>
              <DialogTitle>Profilo</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserRound className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{user?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {user ? (ROLE_LABELS[user.role] ?? user.role) : ""}
                </p>
              </div>
            </div>
            <Button variant="outline" className="h-11 w-full gap-2" onClick={() => setView("password")}>
              <KeyRound className="size-4" />
              Cambia password
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <Button
                type="button"
                variant="ghost"
                className="-ml-2 h-9 w-fit gap-1.5 px-2 text-sm"
                onClick={() => setView("info")}
              >
                <ArrowLeft className="size-4" />
                Profilo
              </Button>
              <DialogTitle>Cambia password</DialogTitle>
              <DialogDescription>Inserisci la password attuale e quella nuova.</DialogDescription>
            </DialogHeader>
            <ChangePasswordForm mode="voluntary" onSuccess={() => setView("info")} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
