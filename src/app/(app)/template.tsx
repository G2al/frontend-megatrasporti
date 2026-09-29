import type { ReactNode } from "react";

export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter space-y-4">{children}</div>;
}
