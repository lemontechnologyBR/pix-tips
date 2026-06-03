"use client";

import { VIEWERS_PLATFORMS } from "@/lib/streaming-platforms";
import {
  KickIcon,
  TwitchIcon,
  YouTubeIcon,
} from "@/components/shared/SocialProviderIcons";
import type { ViewersPlatform } from "@/types";

function PlatformIcon({ platform, className }: { platform: ViewersPlatform; className: string }) {
  switch (platform) {
    case "youtube":
      return <YouTubeIcon className={className} />;
    case "kick":
      return <KickIcon className={className} />;
    default:
      return <TwitchIcon className={className} />;
  }
}

interface ViewersPlatformPickerProps {
  value: ViewersPlatform[];
  onChange: (platforms: ViewersPlatform[]) => void;
}

export function ViewersPlatformPicker({ value, onChange }: ViewersPlatformPickerProps) {
  function togglePlatform(id: ViewersPlatform) {
    if (value.includes(id)) {
      if (value.length === 1) return;
      onChange(value.filter((p) => p !== id));
      return;
    }
    onChange([...value, id]);
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {VIEWERS_PLATFORMS.map((platform) => {
        const checked = value.includes(platform.id);
        return (
          <label
            key={platform.id}
            className={`inline-flex min-h-[2.75rem] cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition ${
              checked
                ? `${platform.borderClass} ${platform.bgClass} ${platform.textClass}`
                : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => togglePlatform(platform.id)}
              className="h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-900 accent-cyan-500"
            />
            <PlatformIcon platform={platform.id} className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{platform.name}</span>
          </label>
        );
      })}
    </div>
  );
}

export function formatViewersPlatformsLabel(platforms: ViewersPlatform[]): string {
  return platforms
    .map((id) => VIEWERS_PLATFORMS.find((p) => p.id === id)?.name ?? id)
    .join(", ");
}
