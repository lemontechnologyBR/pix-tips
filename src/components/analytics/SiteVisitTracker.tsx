"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { hasAnalyticsConsent } from "@/lib/analytics/consent";
import {
  extractUtmFromSearchParams,
  type TrafficTrackPayload,
} from "@/lib/analytics/traffic";

const SKIP_PREFIXES = [
  "/admin",
  "/dashboard",
  "/widget",
  "/api",
  "/onboarding",
  "/maintenance",
];

async function sendTraffic(payload: TrafficTrackPayload) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
  } catch {
    // fallback abaixo
  }
  await fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function SiteVisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return;
    if (pathname === "/demo" || pathname.startsWith("/demo/")) return;
    if (!hasAnalyticsConsent()) return;

    const query = searchParams?.toString() ?? "";
    const dedupeKey = `tp-visit:${pathname}?${query}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "1");

    const utm = extractUtmFromSearchParams(searchParams);
    void sendTraffic({
      type: "site_visit",
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      ...utm,
    });
  }, [pathname, searchParams]);

  return null;
}
