import { DEFAULT_TTS_TEMPLATE } from "@/lib/tts-config";
import type {
  AlertSettings,
  ChatBotSettings,
  Creator,
  PaymentMethod,
  PlanType,
  TipPageSettings,
  Transaction,
  TransactionStatus,
  ViewersPlatform,
} from "@/types";
import { DEFAULT_TIP_PAGE_SETTINGS, normalizeTipPageSettings } from "@/lib/tip-page-defaults";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { normalizeGoalOverlayLayout } from "@/lib/goal-overlay-layout";
import { normalizeViewersOverlayLayout } from "@/lib/viewers-overlay-layout";
import { normalizeViewersPlatforms } from "@/lib/streaming-platforms";
import {
  defaultChatBotSettings,
  normalizeChatBotSettings,
} from "@/lib/chat-bot/settings";
import {
  defaultOverlayWidgets,
  normalizeOverlayWidgets,
} from "@/lib/overlay-presets";
import { normalizeOverlayDragPositions } from "@/lib/overlay-drag-position";
import {
  normalizeLeaderboardMaxItems,
  normalizeSupportersMaxItems,
  normalizeTickerLayout,
  normalizeTickerMaxItems,
  normalizeWidgetPosition,
} from "@/lib/widget-settings";
import {
  DEFAULT_BACKGROUND_MEDIA,
  DEFAULT_TEXT_CONFIG,
} from "@/types";

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function defaultAlertSettings(): AlertSettings {
  return {
    templateId: "slide-up",
    soundId: "ncs-correct",
    soundUrl: null,
    duration: 6,
    textTemplate: "{nome} doou R$ {valor}!",

    // TTS
    ttsEnabled: false,
    ttsVoiceId: "off",
    ttsTemplate: DEFAULT_TTS_TEMPLATE,
    textConfig: { ...DEFAULT_TEXT_CONFIG },
    backgroundMedia: { ...DEFAULT_BACKGROUND_MEDIA },
    showGoalOverlay: true,

    // Goal overlay
    goalOverlayPosition: "top-center",
    goalOverlayLayout: "classic",
    goalBarColor: null,
    goalBgColor: null,
    goalBgOpacity: 0.85,
    goalTextColor: null,
    goalShowPercentage: true,
    goalShowValues: true,
    goalFontSize: 14,
    goalFontFamily: "system-ui, sans-serif",
    goalBorderRadius: 12,
    goalBorderColor: null,
    goalShadow: true,

    // Ticker
    tickerPosition: "bottom-left",
    tickerMaxItems: 5,
    tickerLayout: "list",
    tickerSpeed: 40,
    tickerBgColor: null,
    tickerBgOpacity: 0.85,
    tickerTextColor: null,
    tickerFontSize: 14,
    tickerFontFamily: "system-ui, sans-serif",
    tickerBorderRadius: 8,
    tickerBorderColor: null,
    tickerShadow: true,

    // Stats
    statsPosition: "top-right",
    statsLayout: "classic",
    statsLabel: "Doações na live",
    statsCountLabel: "doações",
    statsBgColor: null,
    statsBgOpacity: 0.85,
    statsTextColor: null,
    statsFontSize: 16,
    statsFontFamily: "system-ui, sans-serif",
    statsBorderRadius: 12,
    statsBorderColor: null,
    statsShadow: true,

    // Last donation
    lastDonationPosition: "bottom-center",
    lastDonationLayout: "classic",
    lastDonationBgColor: null,
    lastDonationBgOpacity: 0.85,
    lastDonationTextColor: null,
    lastDonationFontSize: 16,
    lastDonationFontFamily: "system-ui, sans-serif",
    lastDonationBorderRadius: 12,
    lastDonationBorderColor: null,
    lastDonationShadow: true,

    // Supporters
    supportersPosition: "bottom-right",
    supportersMaxItems: 6,
    supportersTitle: "Apoiadores",
    supportersLayout: "list",
    supportersBgColor: null,
    supportersBgOpacity: 0.85,
    supportersTextColor: null,
    supportersFontSize: 13,
    supportersFontFamily: "system-ui, sans-serif",
    supportersBorderRadius: 12,
    supportersBorderColor: null,
    supportersShadow: true,

    // Leaderboard
    leaderboardPosition: "top-left",
    leaderboardMaxItems: 5,
    leaderboardTitle: "Top Apoiadores",
    leaderboardPeriod: "session",
    leaderboardBgColor: null,
    leaderboardBgOpacity: 0.85,
    leaderboardTextColor: null,
    leaderboardFontSize: 13,
    leaderboardFontFamily: "system-ui, sans-serif",
    leaderboardBorderRadius: 12,
    leaderboardBorderColor: null,
    leaderboardShadow: true,

    // Viewers
    viewersPosition: "top-left",
    viewersLayout: "classic",
    viewersPlatforms: ["twitch"],
    viewersPollInterval: 30,
    viewersLabel: "VIEWERS",
    viewersHideOffline: false,
    viewersBgColor: null,
    viewersBgOpacity: 0.85,
    viewersTextColor: null,
    viewersFontSize: 16,
    viewersFontFamily: "system-ui, sans-serif",
    viewersBorderRadius: 12,
    viewersBorderColor: null,
    viewersShadow: true,

    // Overlay
    overlayPresetId: null,
    overlayWidgets: defaultOverlayWidgets(),
    overlayDragPositions: {},
    overlayScale: 1,
    overlayOpacity: 1,
  };
}

export function defaultTipPageSettings(): TipPageSettings {
  return normalizeTipPageSettings({});
}

export type CreatorRow = {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  goal: number;
  raised: number;
  themeColor: string;
  plan: string;
  isSuspended: boolean;
  widgetToken: string;
  onboardingCompleted: boolean;
  notifyEmailDonation: boolean;
  notifyEmailWeekly: boolean;
  notifyPanelDonation: boolean;
  subscriptionCancelAtPeriodEnd: boolean;
  paymentMethods: string;
  alertSettings: string;
  tipPageSettings: string;
  chatBotSettings?: string;
  proExpiresAt?: Date | null;
  createdAt: Date;
  user: { email: string };
};

export function normalizeAlertSettings(raw: Partial<AlertSettings>): AlertSettings {
  const base = defaultAlertSettings();
  const merged = { ...base, ...raw };
  return {
    ...merged,
    textConfig: { ...DEFAULT_TEXT_CONFIG, ...raw.textConfig },
    backgroundMedia: {
      ...DEFAULT_BACKGROUND_MEDIA,
      ...raw.backgroundMedia,
      filters: {
        ...DEFAULT_BACKGROUND_MEDIA.filters,
        ...raw.backgroundMedia?.filters,
      },
    },
    soundId: merged.soundUrl
      ? merged.soundId
      : resolveAlertSoundId(merged.soundId, merged.soundUrl),
    goalOverlayLayout: normalizeGoalOverlayLayout(merged.goalOverlayLayout),
    goalOverlayPosition: normalizeWidgetPosition(merged.goalOverlayPosition),
    tickerPosition: normalizeWidgetPosition(merged.tickerPosition),
    tickerMaxItems: normalizeTickerMaxItems(merged.tickerMaxItems),
    tickerLayout: normalizeTickerLayout(merged.tickerLayout),
    statsPosition: normalizeWidgetPosition(merged.statsPosition),
    supportersPosition: normalizeWidgetPosition(merged.supportersPosition),
    supportersMaxItems: normalizeSupportersMaxItems(merged.supportersMaxItems),
    lastDonationPosition: normalizeWidgetPosition(merged.lastDonationPosition),
    leaderboardPosition: normalizeWidgetPosition(merged.leaderboardPosition),
    leaderboardMaxItems: normalizeLeaderboardMaxItems(merged.leaderboardMaxItems),
    viewersPosition: normalizeWidgetPosition(merged.viewersPosition ?? "top-left"),
    viewersLayout: normalizeViewersOverlayLayout(merged.viewersLayout),
    viewersPlatforms: normalizeViewersPlatforms(
      merged.viewersPlatforms as ViewersPlatform[] | undefined,
      (merged as { viewersPlatform?: string }).viewersPlatform,
    ),
    // Goal
    goalBarColor: merged.goalBarColor ?? null,
    goalBgColor: merged.goalBgColor ?? null,
    goalBgOpacity: typeof merged.goalBgOpacity === "number" ? Math.max(0, Math.min(1, merged.goalBgOpacity)) : 0.85,
    goalTextColor: merged.goalTextColor ?? null,
    goalShowPercentage: merged.goalShowPercentage ?? true,
    goalShowValues: merged.goalShowValues ?? true,
    goalFontSize: typeof merged.goalFontSize === "number" ? Math.max(10, Math.min(32, merged.goalFontSize)) : 14,
    goalFontFamily: typeof merged.goalFontFamily === "string" ? merged.goalFontFamily : "system-ui, sans-serif",
    goalBorderRadius: typeof merged.goalBorderRadius === "number" ? Math.max(0, Math.min(32, merged.goalBorderRadius)) : 12,
    goalBorderColor: merged.goalBorderColor ?? null,
    goalShadow: merged.goalShadow ?? true,

    // Ticker
    tickerSpeed: typeof merged.tickerSpeed === "number" ? Math.max(10, Math.min(200, merged.tickerSpeed)) : 40,
    tickerBgColor: merged.tickerBgColor ?? null,
    tickerBgOpacity: typeof merged.tickerBgOpacity === "number" ? Math.max(0, Math.min(1, merged.tickerBgOpacity)) : 0.85,
    tickerTextColor: merged.tickerTextColor ?? null,
    tickerFontSize: typeof merged.tickerFontSize === "number" ? Math.max(10, Math.min(32, merged.tickerFontSize)) : 14,
    tickerFontFamily: typeof merged.tickerFontFamily === "string" ? merged.tickerFontFamily : "system-ui, sans-serif",
    tickerBorderRadius: typeof merged.tickerBorderRadius === "number" ? Math.max(0, Math.min(32, merged.tickerBorderRadius)) : 8,
    tickerBorderColor: merged.tickerBorderColor ?? null,
    tickerShadow: merged.tickerShadow ?? true,

    // Stats
    statsLayout: ["classic", "compact", "minimal"].includes(merged.statsLayout as string) ? (merged.statsLayout as "classic" | "compact" | "minimal") : "classic",
    statsLabel: typeof merged.statsLabel === "string" ? merged.statsLabel : "Doações na live",
    statsCountLabel: typeof merged.statsCountLabel === "string" ? merged.statsCountLabel : "doações",
    statsBgColor: merged.statsBgColor ?? null,
    statsBgOpacity: typeof merged.statsBgOpacity === "number" ? Math.max(0, Math.min(1, merged.statsBgOpacity)) : 0.85,
    statsTextColor: merged.statsTextColor ?? null,
    statsFontSize: typeof merged.statsFontSize === "number" ? Math.max(10, Math.min(32, merged.statsFontSize)) : 16,
    statsFontFamily: typeof merged.statsFontFamily === "string" ? merged.statsFontFamily : "system-ui, sans-serif",
    statsBorderRadius: typeof merged.statsBorderRadius === "number" ? Math.max(0, Math.min(32, merged.statsBorderRadius)) : 12,
    statsBorderColor: merged.statsBorderColor ?? null,
    statsShadow: merged.statsShadow ?? true,

    // Last donation
    lastDonationLayout: ["classic", "minimal", "banner", "card"].includes(merged.lastDonationLayout as string) ? (merged.lastDonationLayout as "classic" | "minimal" | "banner" | "card") : "classic",
    lastDonationBgColor: merged.lastDonationBgColor ?? null,
    lastDonationBgOpacity: typeof merged.lastDonationBgOpacity === "number" ? Math.max(0, Math.min(1, merged.lastDonationBgOpacity)) : 0.85,
    lastDonationTextColor: merged.lastDonationTextColor ?? null,
    lastDonationFontSize: typeof merged.lastDonationFontSize === "number" ? Math.max(10, Math.min(32, merged.lastDonationFontSize)) : 16,
    lastDonationFontFamily: typeof merged.lastDonationFontFamily === "string" ? merged.lastDonationFontFamily : "system-ui, sans-serif",
    lastDonationBorderRadius: typeof merged.lastDonationBorderRadius === "number" ? Math.max(0, Math.min(32, merged.lastDonationBorderRadius)) : 12,
    lastDonationBorderColor: merged.lastDonationBorderColor ?? null,
    lastDonationShadow: merged.lastDonationShadow ?? true,

    // Supporters
    supportersTitle: typeof merged.supportersTitle === "string" ? merged.supportersTitle : "Apoiadores",
    supportersLayout: ["list", "grid", "bubbles"].includes(merged.supportersLayout as string) ? (merged.supportersLayout as "list" | "grid" | "bubbles") : "list",
    supportersBgColor: merged.supportersBgColor ?? null,
    supportersBgOpacity: typeof merged.supportersBgOpacity === "number" ? Math.max(0, Math.min(1, merged.supportersBgOpacity)) : 0.85,
    supportersTextColor: merged.supportersTextColor ?? null,
    supportersFontSize: typeof merged.supportersFontSize === "number" ? Math.max(10, Math.min(32, merged.supportersFontSize)) : 13,
    supportersFontFamily: typeof merged.supportersFontFamily === "string" ? merged.supportersFontFamily : "system-ui, sans-serif",
    supportersBorderRadius: typeof merged.supportersBorderRadius === "number" ? Math.max(0, Math.min(32, merged.supportersBorderRadius)) : 12,
    supportersBorderColor: merged.supportersBorderColor ?? null,
    supportersShadow: merged.supportersShadow ?? true,

    // Leaderboard
    leaderboardTitle: typeof merged.leaderboardTitle === "string" ? merged.leaderboardTitle : "Top Apoiadores",
    leaderboardPeriod: merged.leaderboardPeriod === "alltime" ? "alltime" : "session",
    leaderboardBgColor: merged.leaderboardBgColor ?? null,
    leaderboardBgOpacity: typeof merged.leaderboardBgOpacity === "number" ? Math.max(0, Math.min(1, merged.leaderboardBgOpacity)) : 0.85,
    leaderboardTextColor: merged.leaderboardTextColor ?? null,
    leaderboardFontSize: typeof merged.leaderboardFontSize === "number" ? Math.max(10, Math.min(32, merged.leaderboardFontSize)) : 13,
    leaderboardFontFamily: typeof merged.leaderboardFontFamily === "string" ? merged.leaderboardFontFamily : "system-ui, sans-serif",
    leaderboardBorderRadius: typeof merged.leaderboardBorderRadius === "number" ? Math.max(0, Math.min(32, merged.leaderboardBorderRadius)) : 12,
    leaderboardBorderColor: merged.leaderboardBorderColor ?? null,
    leaderboardShadow: merged.leaderboardShadow ?? true,

    // Viewers
    viewersPollInterval: typeof merged.viewersPollInterval === "number" ? Math.max(10, Math.min(300, merged.viewersPollInterval)) : 30,
    viewersLabel: typeof merged.viewersLabel === "string" ? merged.viewersLabel : "VIEWERS",
    viewersHideOffline: merged.viewersHideOffline ?? false,
    viewersBgColor: merged.viewersBgColor ?? null,
    viewersBgOpacity: typeof merged.viewersBgOpacity === "number" ? Math.max(0, Math.min(1, merged.viewersBgOpacity)) : 0.85,
    viewersTextColor: merged.viewersTextColor ?? null,
    viewersFontSize: typeof merged.viewersFontSize === "number" ? Math.max(10, Math.min(32, merged.viewersFontSize)) : 16,
    viewersFontFamily: typeof merged.viewersFontFamily === "string" ? merged.viewersFontFamily : "system-ui, sans-serif",
    viewersBorderRadius: typeof merged.viewersBorderRadius === "number" ? Math.max(0, Math.min(32, merged.viewersBorderRadius)) : 12,
    viewersBorderColor: merged.viewersBorderColor ?? null,
    viewersShadow: merged.viewersShadow ?? true,

    // TTS
    ttsEnabled: merged.ttsEnabled === true,
    ttsVoiceId: typeof merged.ttsVoiceId === "string" ? merged.ttsVoiceId : "off",
    ttsTemplate: typeof merged.ttsTemplate === "string" && merged.ttsTemplate.trim()
      ? merged.ttsTemplate
      : DEFAULT_TTS_TEMPLATE,

    // Overlay
    overlayPresetId:
      typeof merged.overlayPresetId === "string" ? merged.overlayPresetId : null,
    overlayWidgets: normalizeOverlayWidgets(merged.overlayWidgets),
    overlayDragPositions: normalizeOverlayDragPositions(merged.overlayDragPositions),
    overlayScale: typeof merged.overlayScale === "number" ? Math.max(0.5, Math.min(2, merged.overlayScale)) : 1,
    overlayOpacity: typeof merged.overlayOpacity === "number" ? Math.max(0.1, Math.min(1, merged.overlayOpacity)) : 1,
  };
}

export function mapCreatorRow(row: CreatorRow): Creator {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    bio: row.bio,
    avatar: row.avatar,
    goal: row.goal,
    raised: row.raised,
    themeColor: row.themeColor,
    paymentMethods: parseJson<PaymentMethod[]>(row.paymentMethods, ["pix"]),
    alertSettings: normalizeAlertSettings(
      parseJson<Partial<AlertSettings>>(row.alertSettings, {}),
    ),
    widgetToken: row.widgetToken,
    tipPageSettings: normalizeTipPageSettings(
      parseJson<Partial<TipPageSettings>>(row.tipPageSettings, {}),
    ),
    chatBotSettings: normalizeChatBotSettings(
      parseJson<Partial<ChatBotSettings>>(
        row.chatBotSettings ?? "{}",
        defaultChatBotSettings(),
      ),
    ),
    plan: row.plan as PlanType,
    isSuspended: row.isSuspended,
    email: row.user.email,
    onboardingCompleted: row.onboardingCompleted,
    notifyEmailDonation: row.notifyEmailDonation,
    notifyEmailWeekly: row.notifyEmailWeekly,
    notifyPanelDonation: row.notifyPanelDonation,
    subscriptionCancelAtPeriodEnd: row.subscriptionCancelAtPeriodEnd || undefined,
    proExpiresAt: row.proExpiresAt ?? null,
  };
}

export type TransactionRow = {
  id: string;
  creatorId: string;
  amount: number;
  message: string;
  anonymous: boolean;
  donorName: string;
  status: string;
  method: string;
  pixCode: string | null;
  wooviPaymentId: string | null;
  splitPayment: boolean;
  applicationFee: number | null;
  donorTtsVoiceId: string | null;
  createdAt: Date;
};

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    creatorId: row.creatorId,
    amount: row.amount,
    message: row.message,
    anonymous: row.anonymous,
    donorName: row.donorName,
    status: row.status as TransactionStatus,
    method: row.method as PaymentMethod,
    pixCode: row.pixCode ?? undefined,
    wooviPaymentId: row.wooviPaymentId ?? undefined,
    splitPayment: row.splitPayment || undefined,
    applicationFee: row.applicationFee ?? undefined,
    donorTtsVoiceId: row.donorTtsVoiceId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}
