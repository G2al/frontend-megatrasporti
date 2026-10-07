"use client";

import type { ComponentType, ReactNode } from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetDescription, SheetTitle } from "@/components/ui/sheet";

interface InlineSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}

export function InlineSheet({ open, onOpenChange, icon: Icon, title, description, children }: InlineSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Backdrop
          data-slot="sheet-overlay"
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"
        />
        <SheetPrimitive.Popup
          data-slot="sheet-content"
          className="fixed inset-x-0 bottom-0 left-1/2 z-50 flex h-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 flex-col gap-0 overflow-hidden rounded-xl border bg-popover bg-clip-padding text-sm text-popover-foreground shadow-2xl transition duration-200 ease-in-out data-ending-style:translate-y-4 data-ending-style:opacity-0 data-starting-style:translate-y-4 data-starting-style:opacity-0"
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b px-4 pt-4 pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
                <SheetDescription className="truncate">{description}</SheetDescription>
              </div>
            </div>
            <SheetClose render={<Button variant="ghost" className="size-11 shrink-0" aria-label="Chiudi" />}>
              <X />
            </SheetClose>
          </div>
          <div className="min-w-0 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </SheetPrimitive.Popup>
      </SheetPrimitive.Portal>
    </Sheet>
  );
}
