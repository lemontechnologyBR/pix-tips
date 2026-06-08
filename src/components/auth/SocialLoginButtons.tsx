"use client";

import {
  GoogleIcon,
  KickIcon,
  SOCIAL_PROVIDER_ICONS,
  TwitchIcon,
  YouTubeIcon,
} from "@/components/shared/SocialProviderIcons";

const providers = [
  { id: "google", label: "Google", icon: GoogleIcon },
  { id: "twitch", label: "Twitch", icon: TwitchIcon },
  { id: "youtube", label: "YouTube", icon: YouTubeIcon },
  { id: "kick", label: "Kick", icon: KickIcon },
] as const;

export function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-900/50 px-2 text-zinc-500">ou continue com</span>
        </div>
      </div>

      <div className="grid gap-2">
        {providers.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`/api/auth/oauth/${id}`}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-cyan-500/50 hover:bg-cyan-950/30"
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export { SOCIAL_PROVIDER_ICONS };
