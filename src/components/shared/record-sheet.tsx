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
        className="top-[max(1.5rem,env(safe-area-inset-top))] right-auto bottom-auto left-1/2 h-auto max-h-[calc(100dvh-max(3rem,calc(env(safe-area-inset-top)+env(safe-area-inset-bottom)+2rem)))] w-[calc(100%-2rem)] max-w-[600px] -translate-x-1/2 gap-0 rounded-xl border p-0 data-[side=bottom]:data-ending-style:translate-y-[1rem] data-[side=bottom]:data-starting-style:translate-y-[1rem]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b px-4 pt-4 pb-3">
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
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
