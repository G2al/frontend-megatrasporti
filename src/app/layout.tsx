import type { CSSProperties, ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import { brand } from "@/config/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: `${brand.name}: rifornimenti, manutenzioni, documenti e viaggi.`,
  applicationName: brand.name,
  appleWebApp: {
    capable: true,
    title: brand.shortName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: brand.assets.favicon,
    apple: brand.assets.pwa192,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: brand.primary,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} h-full antialiased`}
      style={{ "--brand": brand.primary } as CSSProperties}
    >
      <body className="min-h-full bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
