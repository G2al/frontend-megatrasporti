import type { ReactNode } from "react";
import { AuthGate } from "@/components/layout/auth-gate";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </AuthGate>
  );
}
