import type { Author } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  worker: "Operaio",
  admin: "Amministratore",
};

export function authorTitle(user: Author | null): string {
  if (!user) return "Utente";
  const role = user.role ? ROLE_LABELS[user.role] : null;
  return role ? `${user.full_name} · ${role}` : user.full_name;
}
