"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
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
        className="!inset-0 !mx-auto !h-dvh !max-h-dvh !w-full !max-w-[600px] gap-0 overflow-x-hidden !rounded-none !border-0 p-0 sm:!top-[max(1.5rem,env(safe-area-inset-top))] sm:!bottom-auto sm:!h-auto sm:!max-h-[calc(100dvh-max(3rem,calc(env(safe-area-inset-top)+env(safe-area-inset-bottom)+2rem)))] sm:!rounded-xl sm:!border"
      >
        <div className="flex shrink-0 items-center gap-3 border-b px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:pt-4">
          <SheetClose render={<Button variant="ghost" className="size-11 shrink-0" aria-label="Annulla" />}>
            <ArrowLeft />
          </SheetClose>
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate text-base font-semibold">{title}</SheetTitle>
            <SheetDescription className="truncate">{description}</SheetDescription>
          </div>
        </div>
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
