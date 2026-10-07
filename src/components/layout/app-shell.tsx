"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLogo } from "@/components/shared/brand-logo";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProfileDialog } from "@/components/profile/profile-dialog";
import { PasswordGate } from "@/components/profile/password-gate";
import { useAuth } from "@/hooks/use-auth";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { ready, isAuthenticated, user, logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/login");
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-[600px] space-y-4 p-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (user?.must_change_password) {
    return <PasswordGate />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[600px] flex-col bg-background sm:border-x">
      <header className="sticky top-0 z-30 bg-primary pt-[env(safe-area-inset-top)] text-primary-foreground">
        <div className="flex h-14 items-center justify-between px-4">
          <BrandLogo variant="white" height={32} />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="size-11 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              aria-label="Profilo"
              onClick={() => setProfileOpen(true)}
            >
              <UserRound className="size-5" />
            </Button>
            <Button
              variant="ghost"
              className="size-11 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              aria-label="Esci"
              onClick={() => setConfirmOpen(true)}
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </header>
      <p className="truncate px-4 pt-4 text-base font-semibold">
        Ciao {user?.full_name ?? ""}
      </p>
      <main className="flex-1 space-y-4 px-4 pt-3 pb-32">{children}</main>
      <BottomNav />

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />

      <Dialog open={confirmOpen} onOpenChange={(open) => !loggingOut && setConfirmOpen(open)}>
        <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Esci dall&apos;account</DialogTitle>
            <DialogDescription>Vuoi davvero uscire? Dovrai accedere di nuovo per continuare.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="h-11" disabled={loggingOut} onClick={() => setConfirmOpen(false)}>
              Annulla
            </Button>
            <Button className="h-11" disabled={loggingOut} onClick={() => void handleLogout()}>
              {loggingOut && <Loader2 className="animate-spin" />}
              {loggingOut ? "Uscita..." : "Esci"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
