"use client";

import { usePathname } from "next/navigation";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";

/** Extrai tipo do widget e creatorId da URL /widget/{tipo}/{userId}. */
export function WidgetAnalytics() {
  const pathname = usePathname() || "";
  const parts = pathname.split("/").filter(Boolean);
  // ["widget", "alert", "userId"]
  if (parts[0] !== "widget" || parts.length < 3) return null;
  const widget = parts[1];
  const creatorId = parts[2];
  if (widget === "test") return null;

  return (
    <AnalyticsBeacon
      type="widget_view"
      creatorId={creatorId}
      widget={widget}
      path={pathname}
    />
  );
}
