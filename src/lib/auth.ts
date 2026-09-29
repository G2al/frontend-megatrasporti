import type { User } from "@/types";

const TOKEN_KEY = "mega_token";
const USER_KEY = "mega_user";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return read(TOKEN_KEY);
}

export function getUserRaw(): string | null {
  return read(USER_KEY);
}

export function parseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
    }
  } catch {
    return;
  }
  emit();
}

export function saveSession(token: string, user: User, remember: boolean) {
  clearSession();
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  emit();
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
