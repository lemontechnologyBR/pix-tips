import type { AlertSettings, Creator, PaymentMethod, TipPageSettings } from "@/types";
import {
  defaultChatBotSettings,
  normalizeChatBotSettings,
} from "@/lib/chat-bot/settings";
import { defaultAlertSettings, normalizeAlertSettings } from "@/lib/repositories/json-fields";
import { normalizeTipPageSettings } from "@/lib/tip-page-defaults";

type DbCreator = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  goal: number;
  raised: number;
  themeColor: string;
  plan: string;
  widgetToken: string;
  paymentMethods: string;
  alertSettings: string;
  tipPageSettings: string;
  chatBotSettings?: string;
  onboardingCompleted: boolean;
  notifyEmailDonation: boolean;
  notifyEmailWeekly: boolean;
  notifyPanelDonation: boolean;
  subscriptionCancelAtPeriodEnd?: boolean;
  user: { email: string };
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function mapDbCreatorToCreator(db: DbCreator): Creator {
  return {
    id: db.id,
    username: db.username,
    displayName: db.displayName,
    bio: db.bio,
    avatar: db.avatar,
    goal: db.goal,
    raised: db.raised,
    themeColor: db.themeColor,
    paymentMethods: parseJson<PaymentMethod[]>(db.paymentMethods, ["pix"]),
    alertSettings: normalizeAlertSettings(
      parseJson<Partial<AlertSettings>>(db.alertSettings, {}),
    ),
    widgetToken: db.widgetToken,
    tipPageSettings: normalizeTipPageSettings(
      parseJson<Partial<TipPageSettings>>(db.tipPageSettings, {}),
    ),
    chatBotSettings: normalizeChatBotSettings(
      parseJson(db.chatBotSettings ?? "{}", defaultChatBotSettings()),
    ),
    plan: db.plan === "pro" ? "pro" : "free",
    email: db.user.email,
    onboardingCompleted: db.onboardingCompleted,
    notifyEmailDonation: db.notifyEmailDonation,
    notifyEmailWeekly: db.notifyEmailWeekly,
    notifyPanelDonation: db.notifyPanelDonation,
    subscriptionCancelAtPeriodEnd: db.subscriptionCancelAtPeriodEnd || undefined,
  };
}
