"use client";

import { formatViewerCount } from "@/lib/twitch/format-viewer-count";
import { getViewersPlatform } from "@/lib/streaming-platforms";
import {
  KickIcon,
  TwitchIcon,
  YouTubeIcon,
} from "@/components/shared/SocialProviderIcons";
import type { ViewerPlatformMap } from "@/lib/viewers/types";
import type {
  GoalOverlayPosition,
  OverlayDragPoint,
  ViewersOverlayLayout,
  ViewersPlatform,
} from "@/types";
import { OverlayPositionShell } from "./OverlayPositionShell";

interface ViewersOverlayProps {
  viewers: number;
  live?: boolean;
  platformStats?: ViewerPlatformMap;
  layout?: ViewersOverlayLayout;
  platforms?: ViewersPlatform[];
  position?: GoalOverlayPosition;
  dragPosition?: OverlayDragPoint | null;
  themeColor?: string;
  embedded?: boolean;
  label?: string;
  hideOffline?: boolean;
  bgColor?: string | null;
  textColor?: string | null;
}

function PlatformLogo({
  platform,
  className,
}: {
  platform: ViewersPlatform;
  className: string;
}) {
  switch (platform) {
    case "youtube":
      return <YouTubeIcon className={className} />;
    case "kick":
      return <KickIcon className={className} />;
    case "twitch":
    default:
      return <TwitchIcon className={className} />;
  }
}

function EyeIcon({
  className,
  style,
}: {
  className: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LiveDot({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";
  return (
    <span
      className={`${cls} shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]`}
    />
  );
}

function ViewerCount({
  viewers,
  live,
  className,
  colorOverride,
}: {
  viewers: number;
  live: boolean;
  className: string;
  colorOverride?: string | null;
}) {
  return (
    <span
      className={`font-bold tabular-nums ${live ? "text-white" : "text-zinc-500"} ${className}`}
      style={colorOverride ? { color: colorOverride } : undefined}
    >
      {live ? formatViewerCount(viewers) : "Offline"}
    </span>
  );
}

function ViewersLayoutBody({
  layout,
  viewers,
  live,
  platform,
  themeColor,
  embedded,
  label,
  bgColor,
  textColor,
}: {
  layout: ViewersOverlayLayout;
  viewers: number;
  live: boolean;
  platform: ViewersPlatform;
  themeColor: string;
  embedded: boolean;
  label?: string;
  bgColor?: string | null;
  textColor?: string | null;
}) {
  const countSize = embedded ? "text-lg" : "text-2xl";
  const labelSize = embedded ? "text-[9px]" : "text-[10px]";
  const iconSize = embedded ? "h-4 w-4" : "h-5 w-5";
  const pad = embedded ? "px-3 py-2" : "px-4 py-2.5";
  const platformConfig = getViewersPlatform(platform);
  const logoBox = embedded ? "h-7 w-7" : "h-8 w-8";
  const logoIcon = embedded ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]";

  switch (layout) {
    case "pill":
      return (
        <div
          className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/75 backdrop-blur-md ${
            embedded ? "px-2.5 py-1.5" : "px-3.5 py-2"
          }`}
          style={{ boxShadow: `0 0 20px ${themeColor}18`, ...(bgColor ? { backgroundColor: bgColor } : {}) }}
        >
          {live && <LiveDot />}
          <EyeIcon className={`${iconSize} ${live ? "text-white/70" : "text-zinc-500"}`} style={textColor ? { color: textColor } : undefined} />
          <ViewerCount viewers={viewers} live={live} className={embedded ? "text-base" : "text-lg"} colorOverride={textColor} />
        </div>
      );

    case "compact":
      return (
        <div
          className={`inline-flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-sm ${
            embedded ? "px-2 py-1.5" : "px-2.5 py-2"
          }`}
          style={bgColor ? { backgroundColor: bgColor } : undefined}
        >
          {live && <LiveDot size="sm" />}
          <EyeIcon className={`${iconSize} text-white/60`} style={textColor ? { color: textColor } : undefined} />
          <ViewerCount viewers={viewers} live={live} className={embedded ? "text-base" : "text-xl"} colorOverride={textColor} />
        </div>
      );

    case "badge":
      return (
        <div
          className={`inline-flex items-center gap-2 rounded-lg border backdrop-blur-md ${platformConfig.borderClass} ${platformConfig.bgClass} ${
            embedded ? "px-2.5 py-1.5" : "px-3.5 py-2"
          }`}
          style={{ boxShadow: `0 0 20px ${platformConfig.accent}22`, ...(bgColor ? { backgroundColor: bgColor } : {}) }}
        >
          <div
            className={`flex shrink-0 items-center justify-center rounded-md bg-black/35 ${logoBox}`}
          >
            <PlatformLogo platform={platform} className={logoIcon} />
          </div>
          {live && (
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              Live
            </span>
          )}
          <ViewerCount
            viewers={viewers}
            live={live}
            className={`${embedded ? "text-base" : "text-lg"} ${platformConfig.textClass}`}
            colorOverride={textColor}
          />
        </div>
      );

    case "stream":
      return (
        <div
          className={`flex items-center gap-3 border-y border-white/10 bg-gradient-to-r from-black/90 via-black/75 to-transparent backdrop-blur-sm ${
            embedded ? "min-w-[9rem] px-3 py-2" : "min-w-[12rem] px-4 py-2.5"
          }`}
          style={{
            borderLeftColor: live ? platformConfig.accent : undefined,
            borderLeftWidth: live ? 3 : 0,
            ...(bgColor ? { backgroundColor: bgColor } : {}),
          }}
        >
          <div className={`flex shrink-0 items-center justify-center rounded ${logoBox}`}>
            <PlatformLogo platform={platform} className={logoIcon} />
          </div>
          <div className="flex items-center gap-1.5">
            {live && <LiveDot size="md" />}
            <span
              className={`font-semibold uppercase tracking-widest text-white/40 ${labelSize}`}
              style={textColor ? { color: textColor } : undefined}
            >
              {label ?? "Live"}
            </span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <ViewerCount viewers={viewers} live={live} className={countSize} colorOverride={textColor} />
        </div>
      );

    case "minimal":
      return (
        <div
          className={`text-center ${embedded ? "px-2 py-1" : "px-3 py-1.5"}`}
          style={bgColor ? { backgroundColor: bgColor, borderRadius: "0.5rem" } : undefined}
        >
          <div className="mb-1 flex items-center justify-center gap-1.5">
            <PlatformLogo platform={platform} className={embedded ? "h-3.5 w-3.5" : "h-4 w-4"} />
            <p
              className={`font-medium uppercase tracking-[0.2em] text-white/35 ${labelSize}`}
              style={textColor ? { color: textColor } : undefined}
            >
              {label ?? "Espectadores"}
            </p>
          </div>
          <ViewerCount
            viewers={viewers}
            live={live}
            className={`${embedded ? "text-2xl" : "text-4xl"} drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]`}
            colorOverride={textColor}
          />
          {live && (
            <p className={`mt-0.5 flex items-center justify-center gap-1 text-red-400 ${labelSize}`}>
              <LiveDot size="sm" />
              Ao vivo
            </p>
          )}
        </div>
      );

    case "neon":
      return (
        <div
          className={`rounded-xl border-2 bg-black/85 backdrop-blur-md ${pad}`}
          style={{
            borderColor: live ? platformConfig.accent : "#52525b",
            boxShadow: live
              ? `0 0 28px ${platformConfig.accent}55, inset 0 0 20px ${platformConfig.accent}15`
              : undefined,
            ...(bgColor ? { backgroundColor: bgColor } : {}),
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center rounded-lg ${embedded ? "h-8 w-8" : "h-9 w-9"}`}
              style={{ backgroundColor: `${platformConfig.accent}22` }}
            >
              <PlatformLogo platform={platform} className={iconSize} />
            </div>
            <div>
              <p
                className={`font-medium uppercase tracking-wider text-white/45 ${labelSize}`}
                style={textColor ? { color: textColor } : undefined}
              >
                {label ?? platformConfig.name}
              </p>
              <ViewerCount viewers={viewers} live={live} className={countSize} colorOverride={textColor} />
            </div>
          </div>
        </div>
      );

    case "bold":
      return (
        <div
          className={`rounded-xl border border-white/15 bg-black/85 backdrop-blur-md ${pad}`}
          style={{ boxShadow: `0 8px 32px ${platformConfig.accent}25`, ...(bgColor ? { backgroundColor: bgColor } : {}) }}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                <PlatformLogo platform={platform} className={embedded ? "h-3.5 w-3.5" : "h-4 w-4"} />
                <p
                  className={`font-medium uppercase tracking-wider text-white/40 ${labelSize}`}
                  style={textColor ? { color: textColor } : undefined}
                >
                  {label ?? platformConfig.name}
                </p>
              </div>
              <ViewerCount
                viewers={viewers}
                live={live}
                className={embedded ? "text-2xl" : "text-4xl"}
                colorOverride={textColor}
              />
            </div>
            {live && (
              <div className="flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-1">
                <LiveDot />
                <span className="text-[10px] font-bold uppercase text-red-300">Live</span>
              </div>
            )}
          </div>
        </div>
      );

    case "classic":
    default:
      return (
        <div
          className={`flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md ${pad}`}
          style={{ boxShadow: `0 0 24px ${platformConfig.accent}22`, ...(bgColor ? { backgroundColor: bgColor } : {}) }}
        >
          <div
            className={`relative flex shrink-0 items-center justify-center rounded-lg ${logoBox}`}
            style={{ backgroundColor: `${platformConfig.accent}18` }}
          >
            {live && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
            )}
            <PlatformLogo platform={platform} className={logoIcon} />
          </div>
          <div className="min-w-0">
            <p
              className={`font-medium uppercase tracking-wider text-white/50 ${labelSize}`}
              style={textColor ? { color: textColor } : undefined}
            >
              {label ?? platformConfig.name}
            </p>
            <ViewerCount viewers={viewers} live={live} className={`leading-tight ${countSize}`} colorOverride={textColor} />
          </div>
        </div>
      );
  }
}

export function ViewersOverlay({
  viewers,
  live = true,
  platformStats,
  layout = "classic",
  platforms = ["twitch"],
  position = "top-left",
  dragPosition,
  themeColor = "#8b5cf6",
  embedded = false,
  label,
  hideOffline = false,
  bgColor,
  textColor,
}: ViewersOverlayProps) {
  const activePlatforms = platforms.length > 0 ? platforms : (["twitch"] as ViewersPlatform[]);

  const visiblePlatforms = activePlatforms.filter((platform) => {
    const stats = platformStats?.[platform];
    const platformViewers = stats?.viewers ?? viewers;
    const platformLive = stats?.live ?? live;
    if (hideOffline && !platformLive && platformViewers === 0) return false;
    return true;
  });

  if (visiblePlatforms.length === 0) return null;

  return (
    <OverlayPositionShell
      position={position}
      dragPosition={dragPosition}
      embedded={embedded}
    >
      <div className={`flex flex-col ${embedded ? "gap-1" : "gap-1.5"}`}>
        {visiblePlatforms.map((platform) => {
          const stats = platformStats?.[platform];
          const platformViewers = stats?.viewers ?? viewers;
          const platformLive = stats?.live ?? live;

          return (
          <ViewersLayoutBody
            key={platform}
            layout={layout}
            viewers={platformViewers}
            live={platformLive}
            platform={platform}
            themeColor={themeColor}
            embedded={embedded}
            label={label}
            bgColor={bgColor}
            textColor={textColor}
          />
          );
        })}
      </div>
    </OverlayPositionShell>
  );
}

export type { ViewersOverlayLayout, ViewersPlatform };
