import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.shortName,
    start_url: "/rifornimenti",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "it",
    theme_color: brand.primary,
    background_color: "#ffffff",
    icons: [
      { src: brand.assets.pwa192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: brand.assets.pwa192, sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: brand.assets.pwa512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: brand.assets.pwa512, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
