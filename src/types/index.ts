export type AlertTemplateId =
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "fade-in"
  | "zoom-bounce"
  | "confetti"
  | "emoji-rain"
  | "coins"
  | "stars"
  | "fireworks"
  | "typewriter"
  | "glitch"
  | "neon"
  | "marquee"
  | "split-flap"
  | "mascot-enter"
  | "pet-companion"
  | "ghost-reveal"
  | "game-achievement"
  | "chat-bubble"
  | "spotlight"
  | "stage-curtain"
  | "polaroid"
  | "dot"
  | "line"
  | "corner-badge"
  | "earthquake"
  | "roulette"
  | "kick-alert"
  | "portal"
  | "default"
  | "gif"
  | "heart-pulse"
  | "neon-border";

export type SoundCategory =
  | "classic"
  | "gaming"
  | "ncs"
  | "funny"
  | "musical"
  | "nature"
  | "tech"
  | "voice"
  | "custom";

export type PlanType = "free" | "pro";
export type PaymentMethod = "pix";
export type TransactionStatus = "pending" | "confirmed" | "failed" | "expired";

export interface TextConfig {
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold" | "black";
  fontStyle: "normal" | "italic";
  alignment: "left" | "center" | "right";
  fontFamily: string;
}

export type BackgroundMediaType = "png" | "jpg" | "gif" | "webp";
export type BackgroundFit = "cover" | "contain" | "stretch";
export type BackgroundPosition =
  | "top left"
  | "top center"
  | "top right"
  | "center left"
  | "center"
  | "center right"
  | "bottom left"
  | "bottom center"
  | "bottom right";

export interface BackgroundMediaFilters {
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: boolean;
}

export interface BackgroundMediaConfig {
  mediaId: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  fileType: BackgroundMediaType | null;
  fileName: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  useBackgroundMedia: boolean;
  opacity: number;
  fit: BackgroundFit;
  position: BackgroundPosition;
  autoResize: boolean;
  filters: BackgroundMediaFilters;
}

export interface AlertMediaRecord {
  mediaId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: BackgroundMediaType;
  width: number;
  height: number;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
}

export type CustomSoundFileType = "mp3" | "wav";

export interface CustomSoundRecord {
  id: string;
  userId: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: CustomSoundFileType;
  url: string;
  createdAt: string;
}

export type GoalOverlayPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type GoalOverlayLayout =
  | "classic"
  | "minimal"
  | "pill"
  | "banner"
  | "ring"
  | "neon"
  | "bold"
  | "stream";

export type ViewersPlatform = "twitch" | "youtube" | "kick";

export type ViewersOverlayLayout =
  | "classic"
  | "minimal"
  | "pill"
  | "badge"
  | "compact"
  | "stream"
  | "neon"
  | "bold";

export interface OverlayWidgetSettings {
  alerts: boolean;
  goal: boolean;
  ticker: boolean;
  stats: boolean;
  lastDonation: boolean;
  supporters: boolean;
  leaderboard: boolean;
  viewers: boolean;
}

export interface OverlayDragPoint {
  x: number;
  y: number;
}

export type OverlayWidgetDragKey =
  | "goal"
  | "ticker"
  | "stats"
  | "lastDonation"
  | "supporters"
  | "leaderboard"
  | "viewers";

export type OverlayDragPositions = Partial<
  Record<OverlayWidgetDragKey, OverlayDragPoint>
>;

export interface AlertSettings {
  templateId: AlertTemplateId;
  soundId: string | null;
  soundUrl: string | null;
  duration: number;
  textTemplate: string;

  // TTS
  ttsEnabled: boolean;
  ttsVoiceId: string;
  ttsTemplate: string;
  textConfig: TextConfig;
  backgroundMedia: BackgroundMediaConfig;
  showGoalOverlay: boolean;

  // Goal overlay
  goalOverlayPosition: GoalOverlayPosition;
  goalOverlayLayout: GoalOverlayLayout;
  goalBarColor: string | null;
  goalBgColor: string | null;
  goalBgOpacity: number;
  goalTextColor: string | null;
  goalShowPercentage: boolean;
  goalShowValues: boolean;
  goalFontSize: number;
  goalFontFamily: string;
  goalBorderRadius: number;
  goalBorderColor: string | null;
  goalShadow: boolean;

  // Ticker
  tickerPosition: GoalOverlayPosition;
  tickerMaxItems: number;
  tickerLayout: "list" | "marquee";
  tickerSpeed: number;
  tickerBgColor: string | null;
  tickerBgOpacity: number;
  tickerTextColor: string | null;
  tickerFontSize: number;
  tickerFontFamily: string;
  tickerBorderRadius: number;
  tickerBorderColor: string | null;
  tickerShadow: boolean;

  // Stats
  statsPosition: GoalOverlayPosition;
  statsLayout: "classic" | "compact" | "minimal";
  statsLabel: string;
  statsCountLabel: string;
  statsBgColor: string | null;
  statsBgOpacity: number;
  statsTextColor: string | null;
  statsFontSize: number;
  statsFontFamily: string;
  statsBorderRadius: number;
  statsBorderColor: string | null;
  statsShadow: boolean;

  // Last donation
  lastDonationPosition: GoalOverlayPosition;
  lastDonationLayout: "classic" | "minimal" | "banner" | "card";
  lastDonationBgColor: string | null;
  lastDonationBgOpacity: number;
  lastDonationTextColor: string | null;
  lastDonationFontSize: number;
  lastDonationFontFamily: string;
  lastDonationBorderRadius: number;
  lastDonationBorderColor: string | null;
  lastDonationShadow: boolean;

  // Supporters
  supportersPosition: GoalOverlayPosition;
  supportersMaxItems: number;
  supportersTitle: string;
  supportersLayout: "list" | "grid" | "bubbles";
  supportersBgColor: string | null;
  supportersBgOpacity: number;
  supportersTextColor: string | null;
  supportersFontSize: number;
  supportersFontFamily: string;
  supportersBorderRadius: number;
  supportersBorderColor: string | null;
  supportersShadow: boolean;

  // Leaderboard
  leaderboardPosition: GoalOverlayPosition;
  leaderboardMaxItems: number;
  leaderboardTitle: string;
  leaderboardPeriod: "session" | "alltime";
  leaderboardBgColor: string | null;
  leaderboardBgOpacity: number;
  leaderboardTextColor: string | null;
  leaderboardFontSize: number;
  leaderboardFontFamily: string;
  leaderboardBorderRadius: number;
  leaderboardBorderColor: string | null;
  leaderboardShadow: boolean;

  // Viewers
  viewersPosition: GoalOverlayPosition;
  viewersLayout: ViewersOverlayLayout;
  viewersPlatforms: ViewersPlatform[];
  viewersPollInterval: number;
  viewersLabel: string;
  viewersHideOffline: boolean;
  viewersBgColor: string | null;
  viewersBgOpacity: number;
  viewersTextColor: string | null;
  viewersFontSize: number;
  viewersFontFamily: string;
  viewersBorderRadius: number;
  viewersBorderColor: string | null;
  viewersShadow: boolean;

  // Overlay
  overlayPresetId: string | null;
  overlayWidgets: OverlayWidgetSettings;
  overlayDragPositions: OverlayDragPositions;
  overlayScale: number;
  overlayOpacity: number;
}

export interface LeaderboardEntry {
  name: string;
  amount: number;
  count: number;
}

export interface WidgetDonationItem {
  id: string;
  name: string;
  amount: number;
  message: string;
}

export interface TipPageSettings {
  goalTitle: string;
  presetAmounts: number[];
  minDonation: number;
  thankYouMessage: string;
  backgroundColor: string;
  backgroundStyle: TipPageBackgroundStyle;
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  backgroundImageUrl: string | null;
  backgroundImageOverlay: number;
  fontFamily: string;
  darkMode: boolean;
  showSupporterWall: boolean;
  allowAnonymous: boolean;
  maxSupportersVisible: number;
  qrCodeSettings?: QrCodeSettings;

  /** Layout visual da tip page */
  layoutId: string;

  /** Permite que o doador escolha uma voz TTS para sua mensagem */
  tipTtsEnabled: boolean;
  /** Vozes disponíveis para o doador escolher (subconjunto de TTS_VOICES) */
  tipTtsVoices: string[];
}

export type TipPageBackgroundStyle = "theme" | "solid" | "gradient" | "image";

export type QrTextAlignment = "left" | "center" | "right";

export interface QrCodeTextStyle {
  fontSize: number;
  color: string;
  alignment: QrTextAlignment;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export type QrWidgetAnimation = "none" | "float" | "pulse" | "glow" | "bounce";

export interface QrCodeSettings {
  description: string;
  linkStyle: QrCodeTextStyle;
  descriptionStyle: QrCodeTextStyle;
  cardBackground: string;
  cardBorderRadius: number;
  cardBorderColor: string;
  cardShadow: boolean;
  transparentBg: boolean;
  fontFamily: string;
  qrForeground: string;
  qrBackground: string;
  qrSize: number;
  qrMargin: number;
  showAvatarInQr: boolean;
  animation: QrWidgetAnimation;
  animationSpeed: "slow" | "normal" | "fast";
  widgetPosition: GoalOverlayPosition;
}

export interface ChatBotCommand {
  id: string;
  trigger: string;
  response: string;
  enabled: boolean;
  builtin?: boolean;
}

export interface ChatBotSettings {
  enabled: boolean;
  prefix: string;
  twitchChannel: string | null;
  commands: ChatBotCommand[];
}

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  goal: number;
  raised: number;
  themeColor: string;
  paymentMethods: PaymentMethod[];
  alertSettings: AlertSettings;
  widgetToken: string;
  tipPageSettings: TipPageSettings;
  chatBotSettings: ChatBotSettings;
  plan: PlanType;
  isSuspended?: boolean;
  email: string;
  onboardingCompleted: boolean;
  notifyEmailDonation: boolean;
  notifyEmailWeekly: boolean;
  notifyPanelDonation: boolean;
  subscriptionCancelAtPeriodEnd?: boolean;
  proExpiresAt?: Date | null;
}

export interface Transaction {
  id: string;
  creatorId: string;
  amount: number;
  message: string;
  anonymous: boolean;
  donorName: string;
  status: TransactionStatus;
  method: PaymentMethod;
  pixCode?: string;
  wooviPaymentId?: string;
  splitPayment?: boolean;
  applicationFee?: number;
  donorTtsVoiceId?: string;
  createdAt: string;
}

export interface OnboardingPayload {
  avatar: string;
  displayName: string;
  bio: string;
  goal?: number;
  templateId: AlertTemplateId;
  soundId: string;
}

export interface DonationPayload {
  name: string;
  amount: number;
  message: string;
  templateId: AlertTemplateId;
  soundId: string | null;
  soundUrl: string | null;
  textConfig?: TextConfig;
  backgroundMedia?: BackgroundMediaConfig | null;
  ttsEnabled?: boolean;
  ttsVoiceId?: string;
  ttsTemplate?: string;
}

export interface DashboardOverview {
  totalMonth: number;
  totalMonthChange: number;
  supportersMonth: number;
  supportersChange: number;
  goalProgress: number;
  lastDonation: Transaction | null;
  chartData: { date: string; amount: number }[];
}

export interface UserProfile {
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  plan: PlanType;
  hasPassword: boolean;
  totpEnabled: boolean;
  notifyEmailDonation: boolean;
  notifyEmailWeekly: boolean;
  notifyPanelDonation: boolean;
  marketingOptIn: boolean;
  payoutConfigured: boolean;
  pixKeyMasked: string | null;
  pixKeyType: PixKeyType | null;
  pixHolderName: string | null;
  wooviPixConnected: boolean;
  wooviPixKeyMasked: string | null;
  connectedAccounts: { provider: string; createdAt: string }[];
  kyc: KycProfile;
}

export type DonationFormState =
  | "idle"
  | "validating"
  | "creating_payment"
  | "awaiting_payment"
  | "confirmed"
  | "failed"
  | "expired";

export interface TransactionFilters {
  period?: "7" | "30" | "90" | "year";
  status?: TransactionStatus | "all";
  method?: PaymentMethod | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export type PixKeyType = "cpf" | "email" | "phone" | "random";

export type KycStatus = "none" | "pending" | "approved" | "rejected";
export type KycDocumentType = "rg" | "cnh";
export type CpfVerificationStatus =
  | "skipped"
  | "mock"
  | "matched"
  | "mismatch"
  | "cpf_not_found"
  | "error";

export interface KycProfile {
  status: KycStatus;
  legalName: string | null;
  cpfMasked: string | null;
  birthDate: string | null;
  documentType: KycDocumentType | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  cpfVerificationStatus: CpfVerificationStatus | null;
  cpfVerificationMessage: string | null;
  cpfVerificationProvider: string | null;
  canSubmit: boolean;
  canWithdraw: boolean;
}

export type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export interface Payout {
  id: string;
  /** Valor debitado do saldo (bruto do saque). */
  amount: number;
  /** Taxa de saque, quando registrada. */
  fee?: number;
  /** Valor líquido enviado ao Pix do criador. */
  netAmount: number;
  status: PayoutStatus;
  pixKeyMasked: string;
  createdAt: string;
  completedAt?: string;
}

export interface FinancePayoutSettings {
  pixKey: string | null;
  pixKeyType: PixKeyType | null;
  pixHolderName: string | null;
  pixKeyMasked: string | null;
  configured: boolean;
}

export interface CreatorWooviPixKeyInfo {
  id: string;
  pixKeyMasked: string;
  pixKeyType: PixKeyType;
  isPrimary: boolean;
  balance: number;
  withdrawBlocked: boolean;
  wooviSubaccountLabel: string | null;
  createdAt: string;
}

export interface WooviConnectionInfo {
  splitEnabled: boolean;
  connected: boolean;
  maxPixKeys: number;
  pixKeys: CreatorWooviPixKeyInfo[];
  /** Chave principal (doações) — compatibilidade */
  pixKeyMasked: string | null;
  pixKeyType: PixKeyType | null;
  subaccountName: string | null;
  wooviSubaccountLabel: string | null;
  /** Saldo total em todas as chaves (reais) */
  subaccountBalance: number;
  withdrawBlocked: boolean;
  payoutFee: number;
}

export interface FinanceOverview {
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  totalGross: number;
  totalFees: number;
  totalNet: number;
  commissionRate: number;
  monthGross: number;
  monthFees: number;
  monthNet: number;
  minWithdrawAmount: number;
  kyc: KycProfile;
  payoutSettings: FinancePayoutSettings;
  woovi: WooviConnectionInfo;
  recentPayouts: Payout[];
  recentTransactions: Transaction[];
}

export const DEFAULT_TEXT_CONFIG: TextConfig = {
  fontSize: 24,
  color: "#ffffff",
  fontWeight: "bold",
  fontStyle: "normal",
  alignment: "center",
  fontFamily: "system-ui, sans-serif",
};

export const DEFAULT_BACKGROUND_FILTERS: BackgroundMediaFilters = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: false,
};

export const DEFAULT_BACKGROUND_MEDIA: BackgroundMediaConfig = {
  mediaId: null,
  url: null,
  thumbnailUrl: null,
  fileType: null,
  fileName: null,
  fileSize: null,
  width: null,
  height: null,
  useBackgroundMedia: false,
  opacity: 0.7,
  fit: "cover",
  position: "center",
  autoResize: true,
  filters: { ...DEFAULT_BACKGROUND_FILTERS },
};
