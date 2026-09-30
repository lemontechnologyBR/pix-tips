"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LiveBackground } from "@/components/shared/LiveBackground";
import { DiscordIcon } from "@/components/shared/SocialProviderIcons";
import { formatCurrency, formatRelativeTime } from "@/lib/format";

interface FanMissionItem {
  id: string;
  title: string;
  description: string;
  type: "tip_count" | "tip_total";
  targetValue: number;
  progressValue: number;
  completed: boolean;
  rewardBadge: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatar: string;
}

interface FanBadgeItem {
  badge: string;
  missionTitle: string;
  creatorUsername: string;
  creatorDisplayName: string;
  completedAt: string;
}

interface FanSubscriptionItem {
  id: string;
  planName: string;
  status: string;
  currentPeriodEnd: string | null;
  creatorUsername: string;
  creatorDisplayName: string;
}

interface FanTipItem {
  id: string;
  amount: number;
  message: string;
  createdAt: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatar: string;
}

interface FanAccountOverview {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    hasCreator: boolean;
    username: string | null;
  };
  providers: string[];
  stats: {
    tipsCount: number;
    tipsTotal: number;
    badgesCount: number;
    missionsInProgress: number;
    missionsCompleted: number;
    activeSubscriptions: number;
  };
  badges: FanBadgeItem[];
  missions: FanMissionItem[];
  subscriptions: FanSubscriptionItem[];
  recentTips: FanTipItem[];
}

function formatFanGoal(type: "tip_count" | "tip_total", value: number) {
  if (type === "tip_total") return formatCurrency(value);
  return `${value} tip${value === 1 ? "" : "s"}`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function DiscordConnectControl({ returnTo }: { returnTo: string }) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-1.5">
      <a
        href={`/api/auth/oauth/discord?mode=link&returnTo=${encodeURIComponent(returnTo)}`}
        className="inline-flex items-center gap-2 rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/15 px-3 py-2 text-xs font-medium text-white transition hover:border-[#5865F2]/70 hover:bg-[#5865F2]/25"
      >
        <DiscordIcon className="h-4 w-4" />
        Conectar Discord
      </a>
      <button
        type="button"
        aria-label="Por que conectar Discord?"
        aria-expanded={helpOpen}
        onClick={() => setHelpOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 text-[11px] font-bold text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
      >
        ?
      </button>
      {helpOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-left shadow-xl shadow-black/50">
          <p className="text-xs font-medium text-white">Por que conectar?</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
            Com Discord na conta, o criador pode te dar cargo automático no servidor
            quando você tipa ou completa missões — badge e role caem na sua conta Discord.
          </p>
          <button
            type="button"
            className="mt-2 text-[11px] text-sky-400 hover:underline"
            onClick={() => setHelpOpen(false)}
          >
            Entendi
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

export function FanAccountHub() {
  const [data, setData] = useState<FanAccountOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/fan/overview");
      if (res.status === 401) {
        window.location.href = "/login?redirect=/conta";
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Não foi possível carregar.");
        return;
      }
      setData(json.overview);
      setError(null);
    } catch {
      setError("Falha de rede.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
        Carregando sua conta…
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-950 px-4 text-center">
        <p className="text-sm text-rose-300">{error ?? "Conta indisponível."}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200"
        >
          Tentar de novo
        </button>
      </main>
    );
  }

  const { profile, providers, stats, badges, missions, subscriptions, recentTips } =
    data;
  const hasDiscord = providers.includes("discord");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <LiveBackground className="min-h-screen">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
          <section id="perfil" className="scroll-mt-20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-sky-400/30"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-lg font-bold">
                  {initials(profile.name)}
                </span>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400/90">
                  Conta de fã
                </p>
                <h1 className="text-2xl font-semibold text-white">{profile.name}</h1>
                <p className="text-sm text-zinc-500">{profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!hasDiscord && <DiscordConnectControl returnTo="/conta" />}
              {hasDiscord && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-[#5865F2]/30 bg-[#5865F2]/10 px-3 py-2 text-xs text-[#cdd0ff]">
                  <DiscordIcon className="h-4 w-4" />
                  Discord conectado ✓
                </span>
              )}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Tips" value={String(stats.tipsCount)} />
            <StatCard label="Total tipado" value={formatCurrency(stats.tipsTotal)} />
            <StatCard label="Badges" value={String(stats.badgesCount)} />
            <StatCard
              label="Missões"
              value={`${stats.missionsCompleted}/${stats.missionsCompleted + stats.missionsInProgress}`}
            />
          </section>

          <section id="badges" className="scroll-mt-20 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Badges</h2>
              <p className="text-sm text-zinc-500">
                Conquistas das missões que você completou tipando criadores.
              </p>
            </div>
            {badges.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-sm text-zinc-500">
                Ainda sem badges. Entre numa tip page, tip e complete missões.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <div
                    key={`${b.creatorUsername}-${b.badge}-${b.completedAt}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2"
                  >
                    <span className="rounded-full bg-gradient-to-r from-sky-400 to-violet-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-950">
                      {b.badge}
                    </span>
                    <p className="mt-1.5 text-xs text-zinc-300">{b.missionTitle}</p>
                    <p className="text-[11px] text-zinc-500">
                      @{b.creatorUsername}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="missoes" className="scroll-mt-20 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Missões</h2>
              <p className="text-sm text-zinc-500">
                Progresso salvo na sua conta em cada tip page.
              </p>
            </div>
            {missions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-sm text-zinc-500">
                Nenhuma missão em andamento ainda. Tip em páginas que tenham missões ativas.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {missions.map((m) => {
                  const pct = Math.min(
                    100,
                    Math.round((m.progressValue / m.targetValue) * 100),
                  );
                  return (
                    <li
                      key={m.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {m.title}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            @{m.creatorUsername} · meta{" "}
                            {formatFanGoal(m.type, m.targetValue)}
                            {m.completed ? " · concluída" : ""}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-sky-400/90 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-950">
                          {m.rewardBadge}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400"
                          style={{ width: `${m.completed ? 100 : pct}%` }}
                        />
                      </div>
                      {m.creatorUsername && (
                        <Link
                          href={`/${m.creatorUsername}`}
                          className="mt-2 inline-block text-[11px] text-sky-400 hover:underline"
                        >
                          Abrir tip page →
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section id="assinaturas" className="scroll-mt-20 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Apoio mensal</h2>
              <p className="text-sm text-zinc-500">
                Assinaturas ativas e histórico recente.
              </p>
            </div>
            {subscriptions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-sm text-zinc-500">
                Nenhuma assinatura ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {subscriptions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{s.planName}</p>
                      <p className="text-[11px] text-zinc-500">
                        @{s.creatorUsername}
                        {s.currentPeriodEnd
                          ? ` · até ${new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR")}`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        s.status === "active"
                          ? "bg-sky-400/20 text-sky-300"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="historico" className="scroll-mt-20 space-y-3 pb-10">
            <div>
              <h2 className="text-lg font-semibold text-white">Histórico de tips</h2>
              <p className="text-sm text-zinc-500">Últimos apoios feitos com esta conta.</p>
            </div>
            {recentTips.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-sm text-zinc-500">
                Sem tips nesta conta ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentTips.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {formatCurrency(t.amount)} → @{t.creatorUsername}
                        </p>
                        {t.message ? (
                          <p className="truncate text-[11px] text-zinc-500">{t.message}</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-[11px] text-zinc-500">
                        {formatRelativeTime(t.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </LiveBackground>
    </main>
  );
}
