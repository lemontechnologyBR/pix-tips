"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  TwitchIcon,
  YouTubeIcon,
  DiscordIcon,
  KickIcon,
  StreamLabsIcon,
  StreamElementsIcon,
} from "@/components/shared/SocialProviderIcons";
import type { UserProfile } from "@/types";

interface IntegrationsContentProps {
  connectedAccounts: UserProfile["connectedAccounts"];
  hasPassword: boolean;
  twitchChannel: string | null;
  botConfigured: boolean;
}

type ProviderId = "twitch" | "youtube" | "discord" | "kick" | "streamlabs" | "streamelements";

interface ProviderConfig {
  id: ProviderId;
  label: string;
  description: string;
  color: string;
  comingSoon?: boolean;
  comingSoonFeatures?: string[];
  connectMode?: "oauth" | "link";
  connectHref?: string;
  connectLabel?: string;
  Icon: React.ComponentType<{ className?: string }>;
  features?: { label: string; href?: string; external?: boolean }[];
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "twitch",
    label: "Twitch",
    description: "Login OAuth, ChatBot e integrações de stream",
    color: "from-purple-600/20 to-purple-900/10 border-purple-500/30",
    Icon: TwitchIcon,
    features: [
      { label: "ChatBot para comandos e alertas", href: "/dashboard/chat-bot" },
      { label: "Alertas ao vivo no OBS", href: "/dashboard/widgets" },
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Vincule seu canal e receba super chats",
    color: "from-red-600/20 to-red-900/10 border-red-500/30",
    Icon: YouTubeIcon,
    features: [
      { label: "Alertas ao vivo no OBS", href: "/dashboard/widgets" },
    ],
  },
  {
    id: "discord",
    label: "Discord",
    description: "Login social e notificações de doação",
    color: "from-indigo-600/20 to-indigo-900/10 border-indigo-500/30",
    Icon: DiscordIcon,
    features: [
      { label: "Login via Discord na sua conta" },
    ],
  },
  {
    id: "kick",
    label: "Kick",
    description: "Login social com sua conta Kick",
    color: "from-green-700/20 to-green-900/10 border-green-600/30",
    Icon: KickIcon,
    features: [{ label: "Login via Kick na sua conta" }],
  },
  {
    id: "streamlabs",
    label: "Streamlabs",
    description: "Sincronize alertas e overlays com o Streamlabs Desktop",
    color: "from-teal-600/20 to-emerald-900/10 border-teal-500/30",
    connectMode: "link",
    connectHref: "/dashboard/widgets",
    connectLabel: "Configurar widgets",
    Icon: StreamLabsIcon,
    features: [
      { label: "Alertas de doação no Streamlabs", href: "/dashboard/widgets" },
      { label: "Sincronização de overlays", href: "/dashboard/widgets" },
      { label: "Tema e sons personalizados", href: "/dashboard/widgets" },
    ],
  },
  {
    id: "streamelements",
    label: "StreamElements",
    description: "Conecte seus overlays e alertas ao StreamElements",
    color: "from-indigo-700/20 to-violet-900/10 border-indigo-500/30",
    connectMode: "link",
    connectHref: "/dashboard/widgets",
    connectLabel: "Configurar widgets",
    Icon: StreamElementsIcon,
    features: [
      { label: "Alertas de doação no StreamElements", href: "/dashboard/widgets" },
      { label: "Temas de overlay compatíveis", href: "/dashboard/widgets" },
      { label: "Leaderboard de doações", href: "/dashboard/widgets" },
    ],
  },
];

export function IntegrationsContent({
  connectedAccounts: initialAccounts,
  hasPassword,
  twitchChannel,
  botConfigured,
}: IntegrationsContentProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const connectedSet = useMemo(
    () => new Set(accounts.map((a) => a.provider)),
    [accounts],
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const handleDisconnect = useCallback(
    async (provider: string) => {
      setDisconnecting(provider);
      try {
        const res = await fetch(`/api/auth/oauth/${provider}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          showToast(data.error ?? "Erro ao desvincular.");
          return;
        }
        setAccounts((prev) => prev.filter((a) => a.provider !== provider));
        showToast("Conta desvinculada.");
      } catch {
        showToast("Erro de conexão.");
      } finally {
        setDisconnecting(null);
      }
    },
    [],
  );

  const connectedProviders = PROVIDERS.filter(
    (p) => !p.comingSoon && p.connectMode !== "link" && connectedSet.has(p.id),
  );
  const disconnectedProviders = PROVIDERS.filter(
    (p) => !p.comingSoon && (p.connectMode === "link" || !connectedSet.has(p.id)),
  );
  const comingSoonProviders = PROVIDERS.filter((p) => p.comingSoon);

  return (
    <div className="w-full space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Page hero */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-zinc-900/60 to-zinc-950 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
            <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="2" />
              <circle cx="16" cy="8" r="2" />
              <circle cx="12" cy="16" r="2" />
              <line x1="10" y1="8" x2="14" y2="8" />
              <line x1="8.7" y1="9.7" x2="11" y2="14.3" />
              <line x1="15.3" y1="9.7" x2="13" y2="14.3" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Plataformas e integrações</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Conecte suas contas de streaming para ativar alertas ao vivo, ChatBot, overlays e muito mais.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Plataformas disponíveis", value: PROVIDERS.filter((p) => !p.comingSoon).length.toString() },
            ...(comingSoonProviders.length > 0
              ? [{ label: "Em breve", value: comingSoonProviders.length.toString() }]
              : []),
            { label: "Conectadas", value: connectedSet.size.toString() },
            { label: "Funcionalidades", value: PROVIDERS.filter((p) => !p.comingSoon).reduce((acc, p) => acc + (p.features?.length ?? 0), 0).toString() },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connected */}
      {connectedProviders.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Conectadas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {connectedProviders.map((provider) => {
              const account = accounts.find((a) => a.provider === provider.id);
              const connectedAt = account
                ? new Date(account.createdAt).toLocaleDateString("pt-BR")
                : null;
              const isTwitch = provider.id === "twitch";

              return (
                <div
                  key={provider.id}
                  className={`flex flex-col gap-4 rounded-2xl border bg-gradient-to-br p-5 ${provider.color}`}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950/70 ring-1 ring-white/10">
                      <provider.Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{provider.label}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{provider.description}</p>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Conectado
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 rounded-xl border border-white/5 bg-zinc-950/40 px-3 py-3">
                    {connectedAt && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Vinculado em</span>
                        <span className="text-zinc-300">{connectedAt}</span>
                      </div>
                    )}
                    {isTwitch && twitchChannel && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Canal</span>
                        <a
                          href={`https://twitch.tv/${twitchChannel}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-300 hover:underline"
                        >
                          twitch.tv/{twitchChannel}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {provider.features && provider.features.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                        Funcionalidades
                      </p>
                      {provider.features.map((f) =>
                        f.href ? (
                          <Link
                            key={f.label}
                            href={f.href}
                            className="flex items-center gap-2 rounded-lg border border-white/5 bg-zinc-950/40 px-3 py-2.5 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white"
                          >
                            <span className="h-1 w-1 rounded-full bg-zinc-400" />
                            {f.label}
                            {f.href === "/dashboard/chat-bot" && !botConfigured && (
                              <span className="ml-auto rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">
                                Configurar
                              </span>
                            )}
                          </Link>
                        ) : (
                          <div
                            key={f.label}
                            className="flex items-center gap-2 rounded-lg border border-white/5 bg-zinc-950/40 px-3 py-2.5 text-xs text-zinc-400"
                          >
                            <span className="h-1 w-1 rounded-full bg-zinc-600" />
                            {f.label}
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {/* Disconnect */}
                  <button
                    type="button"
                    disabled={disconnecting === provider.id}
                    onClick={() => handleDisconnect(provider.id)}
                    className="w-full rounded-lg border border-zinc-600 px-3 py-2 text-xs text-zinc-400 transition hover:border-red-500/50 hover:text-red-300 disabled:opacity-50"
                  >
                    {disconnecting === provider.id ? "Desvinculando..." : "Desvincular conta"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Disconnected */}
      {disconnectedProviders.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Disponíveis para conectar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {disconnectedProviders.map((provider) => (
              <div
                key={provider.id}
                className={`flex flex-col gap-4 rounded-2xl border bg-gradient-to-br p-5 ${provider.color}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950/70 ring-1 ring-white/10">
                    <provider.Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{provider.label}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">{provider.description}</p>
                  </div>
                </div>

                {provider.features && provider.features.length > 0 && (
                  <ul className="space-y-1">
                    {provider.features.map((f) => (
                      <li key={f.label} className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="h-1 w-1 rounded-full bg-zinc-600" />
                        {f.label}
                      </li>
                    ))}
                  </ul>
                )}

                {provider.connectMode === "link" ? (
                  <Link
                    href={provider.connectHref ?? "/dashboard/widgets"}
                    className="inline-flex w-full justify-center rounded-lg bg-zinc-900/80 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
                  >
                    {provider.connectLabel ?? "Configurar"}
                  </Link>
                ) : (
                  <a
                    href={`/api/auth/oauth/${provider.id}?mode=link&returnTo=${encodeURIComponent("/dashboard/integrations")}`}
                    className="inline-flex w-full justify-center rounded-lg bg-zinc-900/80 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Conectar {provider.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Coming soon */}
      {comingSoonProviders.length > 0 && (
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Em breve
          </h2>
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
            Em desenvolvimento
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {comingSoonProviders.map((provider) => (
            <div
              key={provider.id}
              className={`relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${provider.color}`}
            >
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-zinc-950/40" />

              <div className="relative flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950/70 ring-1 ring-white/10">
                  <provider.Icon className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{provider.label}</p>
                    <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      Em breve
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">{provider.description}</p>
                </div>
              </div>

              {provider.comingSoonFeatures && (
                <ul className="relative space-y-1.5">
                  {provider.comingSoonFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="relative mt-auto rounded-lg border border-zinc-700/60 px-3 py-2 text-center text-xs text-zinc-600">
                Disponível em breve
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Warning: no password */}
      {!hasPassword && connectedSet.size > 0 && (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400/90">
          Você entrou via rede social. Defina uma senha em{" "}
          <Link href="/forgot-password" className="underline hover:text-amber-300">
            recuperar senha
          </Link>{" "}
          antes de desvincular todas as contas.
        </p>
      )}
    </div>
  );
}
