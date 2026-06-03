"use client";

import { useEffect, useState } from "react";
import { generateQrDataUrl } from "@/lib/qr-code-render";
import { getQrAnimationStyles } from "@/lib/qr-widget-animation";
import type { PlanType, QrCodeSettings } from "@/types";
import { QrWidgetKeyframes } from "./QrWidgetKeyframes";

interface QrCodeWidgetCardProps {
  pageUrl: string;
  displayUrl: string;
  settings: QrCodeSettings;
  avatarUrl?: string;
  plan?: PlanType;
  /** Aplica a animação configurada (preview e widget OBS). */
  animated?: boolean;
  className?: string;
  maxQrSize?: number;
}

export function QrCodeWidgetCard({
  pageUrl,
  displayUrl,
  settings,
  avatarUrl,
  plan = "free",
  animated = true,
  className = "",
  maxQrSize = 220,
}: QrCodeWidgetCardProps) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void generateQrDataUrl(pageUrl, settings, { avatarUrl, plan }).then((url) => {
      if (!cancelled) setQrSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [pageUrl, settings, avatarUrl, plan]);

  const link = settings.linkStyle;
  const desc = settings.descriptionStyle;
  const qrDisplaySize = Math.min(settings.qrSize, maxQrSize);
  const showAnimation = animated && settings.animation !== "none";

  return (
    <>
      <QrWidgetKeyframes />
      <div className={className.trim() || undefined}>
        <div
          className="inline-block w-full max-w-[280px] overflow-hidden"
          style={{
            fontFamily: settings.fontFamily,
            backgroundColor: settings.transparentBg ? "transparent" : settings.cardBackground,
            borderRadius: settings.cardBorderRadius,
            border: `1px solid ${settings.cardBorderColor}`,
            boxShadow: settings.cardShadow ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
            ["--qr-accent" as string]: settings.qrForeground,
            ...getQrAnimationStyles(settings.animation, showAnimation, settings.animationSpeed),
          }}
        >
          <p
            className="truncate px-4 font-semibold"
            style={{
              color: link.color,
              fontSize: link.fontSize,
              textAlign: link.alignment,
              marginTop: link.marginTop,
              marginBottom: link.marginBottom,
              marginLeft: link.marginLeft,
              marginRight: link.marginRight,
            }}
          >
            {displayUrl}
          </p>

          <div className="flex justify-center px-4 pb-1">
            <div
              className="rounded-2xl bg-white p-3 shadow-lg shadow-black/25 ring-1 ring-slate-200/80"
            >
              {qrSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrSrc}
                  alt="QR Code da sua página"
                  className="block rounded-xl"
                  style={{ width: qrDisplaySize, height: qrDisplaySize }}
                />
              ) : (
                <div
                  className="animate-pulse rounded-xl bg-slate-100"
                  style={{ width: qrDisplaySize, height: qrDisplaySize }}
                />
              )}
            </div>
          </div>

          <p
            className="px-4 font-semibold leading-snug"
            style={{
              color: desc.color,
              fontSize: desc.fontSize,
              textAlign: desc.alignment,
              marginTop: desc.marginTop,
              marginBottom: desc.marginBottom,
              marginLeft: desc.marginLeft,
              marginRight: desc.marginRight,
            }}
          >
            {settings.description}
          </p>
        </div>
      </div>
    </>
  );
}
