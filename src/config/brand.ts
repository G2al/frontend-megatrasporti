export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Mega Trasporti",
  shortName: "Mega",
  primary: process.env.NEXT_PUBLIC_BRAND_PRIMARY ?? "#1A2A9C",
  assets: {
    logo: "/brand/logo.png",
    logoWhite: "/brand/logo-white.png",
    pwa192: "/brand/pwa-192.png",
    pwa512: "/brand/pwa-512.png",
    favicon: "/favicon.ico",
  },
} as const;
