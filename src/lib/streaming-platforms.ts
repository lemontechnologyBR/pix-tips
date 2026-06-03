import type { ViewersPlatform } from "@/types";

export interface StreamingPlatformConfig {
  id: ViewersPlatform;
  name: string;
  accent: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
}

export const VIEWERS_PLATFORMS: StreamingPlatformConfig[] = [
  {
    id: "twitch",
    name: "Twitch",
    accent: "#9146FF",
    borderClass: "border-[#9146ff]/45",
    bgClass: "bg-[#9146ff]/20",
    textClass: "text-violet-100",
  },
  {
    id: "youtube",
    name: "YouTube",
    accent: "#FF0000",
    borderClass: "border-red-500/45",
    bgClass: "bg-red-500/20",
    textClass: "text-red-100",
  },
  {
    id: "kick",
    name: "Kick",
    accent: "#53FC18",
    borderClass: "border-[#53FC18]/45",
    bgClass: "bg-[#53FC18]/15",
    textClass: "text-lime-100",
  },
];

export function normalizeViewersPlatform(value: string | undefined): ViewersPlatform {
  if (value && VIEWERS_PLATFORMS.some((p) => p.id === value)) {
    return value as ViewersPlatform;
  }
  return "twitch";
}

export function normalizeViewersPlatforms(
  raw?: ViewersPlatform[] | null,
  legacySingle?: string | null,
): ViewersPlatform[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const valid = raw.filter((id) => VIEWERS_PLATFORMS.some((p) => p.id === id));
    if (valid.length > 0) return valid;
  }
  if (legacySingle) {
    return [normalizeViewersPlatform(legacySingle)];
  }
  return ["twitch"];
}

export function getViewersPlatform(id: ViewersPlatform): StreamingPlatformConfig {
  return VIEWERS_PLATFORMS.find((p) => p.id === id) ?? VIEWERS_PLATFORMS[0];
}
