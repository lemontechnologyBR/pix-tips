import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

function ngrokDevOrigins(): string[] {
  const origins = new Set<string>();
  for (const value of [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.OAUTH_REDIRECT_BASE,
  ]) {
    if (!value?.startsWith("https://")) continue;
    try {
      origins.add(new URL(value).hostname);
    } catch {
      // ignore invalid URL
    }
  }
  return [...origins];
}

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  allowedDevOrigins:
    process.env.NODE_ENV === "production" ? [] : ngrokDevOrigins(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob:",
              "connect-src 'self' https://api.elevenlabs.io https://api.mercadopago.com wss:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/tip/:username",
        destination: "/:username",
        permanent: true,
      },
      {
        source: "/tip/:username/thanks",
        destination: "/:username/thanks",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
