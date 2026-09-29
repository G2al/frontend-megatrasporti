"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  clearSession,
  getToken,
  getUserRaw,
  parseUser,
  saveSession,
  subscribeSession,
} from "@/lib/auth";
import type { LoginResponse } from "@/types";

const noopSubscribe = () => () => {};

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const token = useSyncExternalStore(subscribeSession, getToken, () => null);
  const rawUser = useSyncExternalStore(subscribeSession, getUserRaw, () => null);
  const user = useMemo(() => parseUser(rawUser), [rawUser]);

  const login = useCallback(
    async (fullName: string, password: string, remember: boolean) => {
      const result = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { full_name: fullName, password },
      });
      saveSession(result.token, result.user, remember);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch<void>("/logout", { method: "POST" });
    } catch {
      // la sessione locale va comunque chiusa
    }
    clearSession();
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router]);

  return { ready, isAuthenticated: Boolean(token), user, login, logout };
}
