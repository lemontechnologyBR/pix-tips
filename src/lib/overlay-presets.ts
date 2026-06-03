import type { AlertSettings, OverlayWidgetSettings } from "@/types";

export interface OverlayPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: Partial<AlertSettings>;
}

export const OVERLAY_PRESETS: OverlayPreset[] = [
  {
    id: "stream-br-classic",
    name: "Live BR Clássica",
    description: "Meta stream, ticker e contador.",
    icon: "🇧🇷",
    settings: {
      overlayPresetId: "stream-br-classic",
      goalOverlayLayout: "stream",
      goalOverlayPosition: "top-center",
      tickerPosition: "bottom-left",
      tickerLayout: "list",
      statsPosition: "top-right",
      lastDonationPosition: "bottom-center",
      overlayWidgets: {
        alerts: true,
        goal: true,
        ticker: true,
        stats: true,
        lastDonation: true,
        supporters: false,
        leaderboard: false,
        viewers: false,
      },
    },
  },
  {
    id: "se-inspired",
    name: "Stream Style",
    description: "Meta horizontal, última doação e contador.",
    icon: "🎭",
    settings: {
      overlayPresetId: "se-inspired",
      goalOverlayLayout: "stream",
      goalOverlayPosition: "top-center",
      lastDonationPosition: "bottom-center",
      statsPosition: "top-right",
      overlayWidgets: {
        alerts: true,
        goal: true,
        ticker: false,
        stats: true,
        lastDonation: true,
        supporters: false,
        leaderboard: false,
        viewers: false,
      },
    },
  },
  {
    id: "full-overlay",
    name: "Overlay Completo",
    description: "Todos os widgets com posições balanceadas.",
    icon: "✨",
    settings: {
      overlayPresetId: "full-overlay",
      goalOverlayLayout: "classic",
      goalOverlayPosition: "top-center",
      tickerPosition: "bottom-left",
      tickerLayout: "marquee",
      statsPosition: "top-right",
      lastDonationPosition: "bottom-center",
      supportersPosition: "bottom-right",
      leaderboardPosition: "top-left",
      overlayWidgets: {
        alerts: true,
        goal: true,
        ticker: true,
        stats: true,
        lastDonation: true,
        supporters: true,
        leaderboard: true,
        viewers: false,
      },
    },
  },
  {
    id: "minimal-clean",
    name: "Clean Minimal",
    description: "Só meta e alertas.",
    icon: "◻",
    settings: {
      overlayPresetId: "minimal-clean",
      goalOverlayLayout: "minimal",
      goalOverlayPosition: "top-center",
      overlayWidgets: {
        alerts: true,
        goal: true,
        ticker: false,
        stats: false,
        lastDonation: false,
        supporters: false,
        leaderboard: false,
        viewers: false,
      },
    },
  },
  {
    id: "social-wall",
    name: "Mural Social",
    description: "Ranking, apoiadores e ticker marquee.",
    icon: "👥",
    settings: {
      overlayPresetId: "social-wall",
      tickerPosition: "bottom-left",
      tickerLayout: "marquee",
      supportersPosition: "bottom-right",
      leaderboardPosition: "top-left",
      overlayWidgets: {
        alerts: true,
        goal: false,
        ticker: true,
        stats: false,
        lastDonation: false,
        supporters: true,
        leaderboard: true,
        viewers: false,
      },
    },
  },
  {
    id: "fundraising-bold",
    name: "Campanha Bold",
    description: "Meta em destaque com contador.",
    icon: "🎯",
    settings: {
      overlayPresetId: "fundraising-bold",
      goalOverlayLayout: "bold",
      goalOverlayPosition: "top-center",
      statsPosition: "top-right",
      lastDonationPosition: "bottom-center",
      overlayWidgets: {
        alerts: true,
        goal: true,
        ticker: false,
        stats: true,
        lastDonation: true,
        supporters: false,
        leaderboard: false,
        viewers: false,
      },
    },
  },
  {
    id: "neon-night",
    name: "Neon Night",
    description: "Meta neon e ticker para lives noturnas.",
    icon: "✦",
    settings: {
      overlayPresetId: "neon-night",
      goalOverlayLayout: "neon",
      goalOverlayPosition: "top-center",
      tickerPosition: "bottom-left",
      tickerLayout: "list",
      overlayWidgets: {
        alerts: true,
        goal: true,
        ticker: true,
        stats: false,
        lastDonation: false,
        supporters: false,
        leaderboard: false,
        viewers: false,
      },
    },
  },
  {
    id: "alerts-only",
    name: "Só Alertas",
    description: "Apenas alertas de doação.",
    icon: "🔔",
    settings: {
      overlayPresetId: "alerts-only",
      overlayWidgets: {
        alerts: true,
        goal: false,
        ticker: false,
        stats: false,
        lastDonation: false,
        supporters: false,
        leaderboard: false,
        viewers: false,
      },
    },
  },
];

export function getOverlayPreset(id: string): OverlayPreset | undefined {
  return OVERLAY_PRESETS.find((preset) => preset.id === id);
}

export function defaultOverlayWidgets(): OverlayWidgetSettings {
  return {
    alerts: true,
    goal: true,
    ticker: true,
    stats: true,
    lastDonation: true,
    supporters: false,
    leaderboard: false,
    viewers: false,
  };
}

export function normalizeOverlayWidgets(
  raw?: Partial<OverlayWidgetSettings>,
): OverlayWidgetSettings {
  return { ...defaultOverlayWidgets(), ...raw };
}

export function applyOverlayPreset(
  current: AlertSettings,
  presetId: string,
): AlertSettings {
  const preset = getOverlayPreset(presetId);
  if (!preset) return current;

  return {
    ...current,
    ...preset.settings,
    overlayPresetId: presetId,
    overlayWidgets: normalizeOverlayWidgets(preset.settings.overlayWidgets),
  };
}

/** @deprecated Use OVERLAY_PRESETS */
export const OVERLAY_COMMUNITY_PRESETS = OVERLAY_PRESETS;
