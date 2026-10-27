export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Mega Trasporti",
  shortName: process.env.NEXT_PUBLIC_BRAND_SHORT_NAME ?? "Mega",
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "",
  primary: process.env.NEXT_PUBLIC_BRAND_PRIMARY ?? "#1A2A9C",
  logoAspectRatio: Number(process.env.NEXT_PUBLIC_BRAND_LOGO_RATIO ?? 4),
  assets: {
    logo: "/brand/logo.png",
    logoWhite: "/brand/logo-white.png",
    pwa192: "/brand/pwa-192.png",
    pwa512: "/brand/pwa-512.png",
    favicon: "/favicon.ico",
  },
} as const;
