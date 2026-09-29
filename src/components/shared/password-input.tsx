"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="h-11 pr-12" />
      <Button
        type="button"
        variant="ghost"
        className="absolute top-0 right-0 size-11"
        aria-label={visible ? "Nascondi password" : "Mostra password"}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}
