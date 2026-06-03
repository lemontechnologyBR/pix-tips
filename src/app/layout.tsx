import { Suspense } from "react";
import { WidgetAwareProviders } from "@/components/WidgetAwareProviders";
import {
  BRAND_NAME,
  BRAND_TAGLINE,
} from "@/lib/brand";
import { jetbrainsMono, spaceGrotesk } from "@/lib/fonts";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "pix.tips — Doações para criadores",
    template: "%s | pix.tips",
  },
  description:
    `${BRAND_NAME} — ${BRAND_TAGLINE}. Pix integrado e alertas em tempo real para live streamers.`,
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon",
  },
  applicationName: BRAND_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#06b6d4" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="web3-bg min-h-full flex flex-col text-white">
        <Suspense fallback={null}>
          <WidgetAwareProviders>{children}</WidgetAwareProviders>
        </Suspense>
      </body>
    </html>
  );
}
