"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Creator } from "@/types";
import type { WidgetUrls } from "@/lib/widget-urls";
import { AlertsEditor } from "./AlertsEditor";
import { GoalEditor } from "./GoalEditor";
import { LastDonationEditor } from "./LastDonationEditor";
import { LeaderboardEditor } from "./LeaderboardEditor";
import { OverlayEditor } from "./OverlayEditor";
import { QrCodeEditor } from "./QrCodeEditor";
import { StatsEditor } from "./StatsEditor";
import { SupportersEditor } from "./SupportersEditor";
import { TickerEditor } from "./TickerEditor";
import { ViewersEditor } from "./ViewersEditor";
import { WidgetTabIcon } from "./WidgetTabIcon";

const WIDGET_TABS = [
  {
    id: "overlay",
    label: "Overlay",
    description: "Todos os widgets em uma URL para o OBS.",
    tag: "Recomendado",
  },
  {
    id: "qrcode",
    label: "QR Code",
    description: "Cartão para compartilhar ou exibir na live.",
    tag: "Compartilhar",
  },
  {
    id: "alerts",
    label: "Alertas",
    description: "Animação e som quando alguém doa.",
    tag: "Doações",
  },
  {
    id: "goals",
    label: "Metas",
    description: "Barra de progresso da arrecadação na live.",
    tag: "Arrecadação",
  },
  {
    id: "last",
    label: "Última doação",
    description: "Destaque da tip mais recente.",
    tag: "Live",
  },
  {
    id: "ticker",
    label: "Ticker",
    description: "Faixa ou lista com doações recentes.",
    tag: "Live",
  },
  {
    id: "stats",
    label: "Contador",
    description: "Total e quantidade na sessão.",
    tag: "Live",
  },
  {
    id: "viewers",
    label: "Espectadores",
    description: "Viewers ao vivo da Twitch.",
    tag: "Twitch",
  },
  {
    id: "leaderboard",
    label: "Ranking",
    description: "Top apoiadores por valor acumulado.",
    tag: "Social",
  },
  {
    id: "supporters",
    label: "Apoiadores",
    description: "Mural com nomes e valores recentes.",
    tag: "Social",
  },
] as const;

type WidgetTab = (typeof WIDGET_TABS)[number]["id"];

interface WidgetsDashboardProps {
  creator: Creator;
  widgetUrls: WidgetUrls;
  twitchConnected?: boolean;
  twitchChannel?: string | null;
}

function resolveTab(param: string | null): WidgetTab {
  if (param && WIDGET_TABS.some((tab) => tab.id === param)) {
    return param as WidgetTab;
  }
  return "overlay";
}

function WidgetEditor({
  tab,
  creator,
  widgetUrls,
  twitchConnected,
  twitchChannel,
}: {
  tab: WidgetTab;
  creator: Creator;
  widgetUrls: WidgetUrls;
  twitchConnected: boolean;
  twitchChannel: string | null;
}) {
  switch (tab) {
    case "overlay":
      return <OverlayEditor creator={creator} widgetUrl={widgetUrls.overlay} />;
    case "qrcode":
      return (
        <QrCodeEditor initialCreator={creator} widgetUrl={widgetUrls.qrcode} embedded />
      );
    case "alerts":
      return <AlertsEditor creator={creator} widgetUrl={widgetUrls.alerts} embedded />;
    case "goals":
      return <GoalEditor creator={creator} widgetUrl={widgetUrls.goals} />;
    case "last":
      return <LastDonationEditor creator={creator} widgetUrl={widgetUrls.last} />;
    case "ticker":
      return <TickerEditor creator={creator} widgetUrl={widgetUrls.ticker} />;
    case "stats":
      return <StatsEditor creator={creator} widgetUrl={widgetUrls.stats} />;
    case "viewers":
      return (
        <ViewersEditor
          creator={creator}
          widgetUrl={widgetUrls.viewers}
          twitchConnected={twitchConnected}
          twitchChannel={twitchChannel}
        />
      );
    case "leaderboard":
      return <LeaderboardEditor creator={creator} widgetUrl={widgetUrls.leaderboard} />;
    case "supporters":
      return <SupportersEditor creator={creator} widgetUrl={widgetUrls.supporters} />;
  }
}

function WidgetsDashboardContent({
  creator,
  widgetUrls,
  twitchConnected = false,
  twitchChannel = null,
}: WidgetsDashboardProps) {
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Widgets</h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">
            Ferramentas para OBS, Streamlabs e outras plataformas de live.
          </p>
        </div>
        <Link
          href="/dashboard/tip-page"
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
        >
          Editar minha página
        </Link>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        role="tablist"
        aria-label="Tipo de widget"
      >
        {WIDGET_TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <Link
              key={item.id}
              href={`/dashboard/widgets?tab=${item.id}`}
              role="tab"
              aria-selected={selected}
              className={`group relative flex items-start gap-3 rounded-xl border p-3.5 transition ${
                selected
                  ? "border-cyan-500/60 bg-gradient-to-br from-cyan-500/15 to-cyan-900/5 shadow-[inset_0_1px_0_0_rgba(34,211,238,0.12)]"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/70"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                  selected
                    ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-300"
                    : "border-zinc-700/80 bg-zinc-950 text-zinc-500 group-hover:border-zinc-600 group-hover:text-zinc-300"
                }`}
              >
                <WidgetTabIcon name={item.id} className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <p
                    className={`truncate text-sm font-semibold ${selected ? "text-cyan-100" : "text-zinc-100"}`}
                  >
                    {item.label}
                  </p>
                  <span
                    className={`hidden rounded-full px-1.5 py-px text-[10px] font-medium xl:inline ${
                      selected
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-500">
                  {item.description}
                </p>
              </div>

              {selected && (
                <span
                  className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20">
        <div className="p-4 sm:p-5">
          <WidgetEditor
            tab={tab}
            creator={creator}
            widgetUrls={widgetUrls}
            twitchConnected={twitchConnected}
            twitchChannel={twitchChannel}
          />
        </div>
      </div>
    </div>
  );
}

function WidgetsDashboardFallback() {
  return (
    <div className="w-full animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-zinc-800" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-zinc-900" />
        ))}
      </div>
      <div className="h-96 rounded-xl bg-zinc-900" />
    </div>
  );
}

export function WidgetsDashboard(props: WidgetsDashboardProps) {
  return (
    <Suspense fallback={<WidgetsDashboardFallback />}>
      <WidgetsDashboardContent {...props} />
    </Suspense>
  );
}
