"use client";

import {
  DiscordIcon,
  GoogleIcon,
  TwitchIcon,
} from "@/components/shared/SocialProviderIcons";
import { useTipFanSession } from "./TipFanSessionContext";

const FAN_PROVIDERS = [
  { id: "discord", label: "Discord", Icon: DiscordIcon },
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "twitch", label: "Twitch", Icon: TwitchIcon },
] as const;

interface TipFanAuthBarProps {
  returnTo: string;
  themeColor: string;
}

export function TipFanAuthBar({ returnTo }: TipFanAuthBarProps) {
  const { fan, loading } = useTipFanSession();

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-xs text-zinc-500">
        Carregando…
      </div>
    );
  }

  // Logado: identidade vai na navbar de cima
  if (fan) return null;

  const encodedReturn = encodeURIComponent(returnTo);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3">
      <p className="text-xs font-medium text-zinc-200">Entrar pra acumular recompensas</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
        Opcional. Tip continua sem login — com conta, missões e badges ficam salvos.
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {FAN_PROVIDERS.map(({ id, label, Icon }) => (
          <a
            key={id}
            href={`/api/auth/oauth/${id}?returnTo=${encodedReturn}&kind=fan`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[11px] font-medium text-zinc-200 transition hover:border-sky-400/40 hover:text-white"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
