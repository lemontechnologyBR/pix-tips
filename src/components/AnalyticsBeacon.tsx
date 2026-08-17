"use client";

import { useEffect } from "react";
import { extractUtmFromSearchParams } from "@/lib/analytics/traffic";

interface AnalyticsBeaconProps {
  type: "tip_page_view" | "widget_view";
  creatorId?: string;
  path?: string;
  widget?: string;
}

export function AnalyticsBeacon({
  type,
  creatorId,
  path,
  widget,
}: AnalyticsBeaconProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm = extractUtmFromSearchParams(params);
    const search = window.location.search;
    const fullPath = `${path ?? window.location.pathname}${search}`;
    const payload = JSON.stringify({
      type,
      creatorId,
      path: fullPath,
      widget,
      referrer: document.referrer || undefined,
      ...utm,
    });

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/track", blob);
        return;
      }
    } catch {
      // fallback abaixo
    }
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  }, [type, creatorId, path, widget]);

  return null;
}
