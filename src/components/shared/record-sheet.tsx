"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

interface RecordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}

export function RecordSheet({ open, onOpenChange, title, description, children }: RecordSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-0 p-0 data-[side=bottom]:top-0 data-[side=bottom]:h-dvh data-[side=bottom]:border-t-0 sm:data-[side=bottom]:top-6 sm:data-[side=bottom]:right-auto sm:data-[side=bottom]:left-1/2 sm:data-[side=bottom]:h-auto sm:data-[side=bottom]:max-h-[calc(100dvh-3rem)] sm:data-[side=bottom]:w-full sm:data-[side=bottom]:max-w-[600px] sm:data-[side=bottom]:-translate-x-1/2 sm:data-[side=bottom]:rounded-xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <div className="min-w-0">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </div>
          <SheetClose
            render={<Button variant="ghost" className="size-11 shrink-0" aria-label="Chiudi" />}
          >
            <X />
          </SheetClose>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
