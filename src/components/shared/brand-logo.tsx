"use client";

import { useState } from "react";
import Image from "next/image";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "color" | "white";
  className?: string;
  height?: number;
}

export function BrandLogo({ variant = "color", className, height = 40 }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = variant === "white" ? brand.assets.logoWhite : brand.assets.logo;

  if (failed) {
    return (
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          variant === "white" ? "text-white" : "text-primary",
          className,
        )}
      >
        {brand.name}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={brand.name}
      width={height * 4}
      height={height}
      unoptimized
      priority
      onError={() => setFailed(true)}
      className={cn("w-auto object-contain", className)}
      style={{ height }}
    />
  );
}
