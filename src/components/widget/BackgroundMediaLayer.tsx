"use client";

import type { BackgroundMediaConfig } from "@/types";

interface BackgroundMediaLayerProps {
  config: BackgroundMediaConfig;
  className?: string;
  rounded?: boolean;
}

export function backgroundFilterStyle(
  config: BackgroundMediaConfig,
): React.CSSProperties | undefined {
  const { filters } = config;
  const parts: string[] = [];
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.grayscale) parts.push("grayscale(100%)");
  return parts.length ? { filter: parts.join(" ") } : undefined;
}

export function BackgroundMediaLayer({
  config,
  className = "",
  rounded = true,
}: BackgroundMediaLayerProps) {
  if (!config.useBackgroundMedia || !config.url) return null;

  const objectFit =
    config.fit === "stretch" ? "fill" : config.fit === "contain" ? "contain" : "cover";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${rounded ? "rounded-[inherit]" : ""} ${className}`}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={config.url}
        alt=""
        className="h-full w-full"
        style={{
          objectFit,
          objectPosition: config.position,
          opacity: config.opacity,
          ...backgroundFilterStyle(config),
        }}
      />
    </div>
  );
}

export function CharacterMedia({
  config,
  fallback,
  className = "",
}: {
  config: BackgroundMediaConfig;
  fallback: string;
  className?: string;
}) {
  if (config.useBackgroundMedia && config.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={config.url}
        alt=""
        className={`object-contain ${className}`}
        style={{
          opacity: config.opacity,
          ...backgroundFilterStyle(config),
        }}
      />
    );
  }
  return <span className={className}>{fallback}</span>;
}
