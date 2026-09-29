"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();

  useEffect(() => {
    if (ready) router.replace(isAuthenticated ? "/rifornimenti" : "/login");
  }, [ready, isAuthenticated, router]);

  return null;
}
