"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Truck, Wrench } from "lucide-react";
import { PumpIcon } from "@/components/shared/pump-icon";
import { cn } from "@/lib/utils";

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

const items: ReadonlyArray<{ href: string; label: string; icon: NavIcon }> = [
  { href: "/rifornimenti", label: "Rifornimenti", icon: PumpIcon },
  { href: "/manutenzioni", label: "Manutenzioni", icon: Wrench },
  { href: "/documenti", label: "Documenti", icon: FileText },
  { href: "/viaggi", label: "Viaggi", icon: Truck },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigazione principale"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[600px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="pointer-events-auto flex items-center gap-1 rounded-2xl border bg-background/95 p-1.5 shadow-lg backdrop-blur">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className={cn(
                "min-w-0 transition-[flex-grow] duration-300 ease-out motion-reduce:transition-none",
                active ? "grow-[2.4]" : "grow",
              )}
              style={{ flexBasis: 0 }}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl px-2 text-sm font-semibold transition-colors duration-300 active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground active:bg-muted",
                )}
              >
                <Icon className="size-6 shrink-0" aria-hidden />
                {active && <span className="animate-in fade-in slide-in-from-left-2 truncate duration-300">{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
