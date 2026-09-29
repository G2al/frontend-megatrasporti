"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();

  useEffect(() => {
    if (ready && isAuthenticated) router.replace("/rifornimenti");
  }, [ready, isAuthenticated, router]);

  if (!ready || isAuthenticated) return null;
  return <>{children}</>;
}
