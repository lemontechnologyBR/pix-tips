"use client";

import { useEffect } from "react";

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
    const payload = JSON.stringify({ type, creatorId, path, widget });
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/track", blob);
        return;
      }
    } catch {
      // fallback below
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
