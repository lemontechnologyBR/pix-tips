import { generateAffiliateCode } from "@/lib/affiliate";
import { prisma } from "@/lib/db";
import {
  defaultAlertSettings,
  defaultTipPageSettings,
  mapCreatorRow,
  parseJson,
  type CreatorRow,
} from "@/lib/repositories/json-fields";
import type { ChatBotSettings, Creator, TipPageSettings } from "@/types";
import { defaultChatBotSettings, normalizeChatBotSettings } from "@/lib/chat-bot/settings";

const creatorInclude = { user: { select: { email: true } } } as const;

export async function getByUsername(username: string): Promise<Creator | null> {
  const row = await prisma.creator.findUnique({
    where: { username: username.toLowerCase() },
    include: creatorInclude,
  });
  return row ? mapCreatorRow(row as CreatorRow) : null;
}

export async function getById(id: string): Promise<Creator | null> {
  const row = await prisma.creator.findUnique({
    where: { id },
    include: creatorInclude,
  });
  return row ? mapCreatorRow(row as CreatorRow) : null;
}

export async function getByEmail(email: string): Promise<Creator | null> {
  const row = await prisma.creator.findFirst({
    where: { user: { email: email.toLowerCase() } },
    include: creatorInclude,
  });
  return row ? mapCreatorRow(row as CreatorRow) : null;
}

export async function getByUserId(userId: string): Promise<Creator | null> {
  const row = await prisma.creator.findUnique({
    where: { userId },
    include: creatorInclude,
  });
  return row ? mapCreatorRow(row as CreatorRow) : null;
}

export async function create(input: {
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  goal?: number;
  themeColor?: string;
  plan?: string;
  widgetToken: string;
  paymentMethods?: string;
  alertSettings?: string;
  tipPageSettings?: string;
  id?: string;
}) {
  const row = await prisma.creator.create({
    data: {
      id: input.id,
      userId: input.userId,
      username: input.username.toLowerCase(),
      displayName: input.displayName,
      bio: input.bio ?? "",
      avatar: input.avatar ?? "",
      goal: input.goal ?? 0,
      themeColor: input.themeColor ?? "#9146ff",
      plan: input.plan ?? "free",
      widgetToken: input.widgetToken,
      affiliateCode: generateAffiliateCode(input.username),
      paymentMethods: input.paymentMethods ?? JSON.stringify(["pix"]),
      alertSettings:
        input.alertSettings ?? JSON.stringify(defaultAlertSettings()),
      tipPageSettings:
        input.tipPageSettings ?? JSON.stringify(defaultTipPageSettings()),
    },
    include: creatorInclude,
  });
  return mapCreatorRow(row as CreatorRow);
}

export async function update(
  id: string,
  patch: Partial<Creator>,
): Promise<Creator | null> {
  const existing = await prisma.creator.findUnique({ where: { id } });
  if (!existing) return null;

  const data: Record<string, unknown> = {};
  if (patch.displayName !== undefined) data.displayName = patch.displayName;
  if (patch.bio !== undefined) data.bio = patch.bio;
  if (patch.avatar !== undefined) data.avatar = patch.avatar;
  if (patch.goal !== undefined) data.goal = patch.goal;
  if (patch.raised !== undefined) data.raised = patch.raised;
  if (patch.themeColor !== undefined) data.themeColor = patch.themeColor;
  if (patch.plan !== undefined) data.plan = patch.plan;
  if (patch.isSuspended !== undefined) data.isSuspended = patch.isSuspended;
  if (patch.widgetToken !== undefined) data.widgetToken = patch.widgetToken;
  if (patch.onboardingCompleted !== undefined) {
    data.onboardingCompleted = patch.onboardingCompleted;
  }
  if (patch.notifyEmailDonation !== undefined) {
    data.notifyEmailDonation = patch.notifyEmailDonation;
  }
  if (patch.notifyEmailWeekly !== undefined) {
    data.notifyEmailWeekly = patch.notifyEmailWeekly;
  }
  if (patch.notifyPanelDonation !== undefined) {
    data.notifyPanelDonation = patch.notifyPanelDonation;
  }
  if (patch.subscriptionCancelAtPeriodEnd !== undefined) {
    data.subscriptionCancelAtPeriodEnd = patch.subscriptionCancelAtPeriodEnd;
  }
  if (patch.paymentMethods !== undefined) {
    data.paymentMethods = JSON.stringify(patch.paymentMethods);
  }
  if (patch.alertSettings !== undefined) {
    const current = parseJson(existing.alertSettings, defaultAlertSettings());
    data.alertSettings = JSON.stringify({ ...current, ...patch.alertSettings });
  }
  if (patch.tipPageSettings !== undefined) {
    const current = parseJson(existing.tipPageSettings, defaultTipPageSettings());
    data.tipPageSettings = JSON.stringify({
      ...current,
      ...patch.tipPageSettings,
    });
  }
  if (patch.chatBotSettings !== undefined) {
    const current = normalizeChatBotSettings(
      parseJson(existing.chatBotSettings ?? "{}", defaultChatBotSettings()),
    );
    data.chatBotSettings = JSON.stringify(
      normalizeChatBotSettings({ ...current, ...patch.chatBotSettings }),
    );
  }

  if (Object.keys(data).length === 0) {
    return getById(id);
  }

  const row = await prisma.creator.update({
    where: { id },
    data,
    include: creatorInclude,
  });
  return mapCreatorRow(row as CreatorRow);
}

export async function getDemoOrSeed(): Promise<Creator> {
  const existing = await getByUsername("demo");
  if (existing) return existing;

  const { ensureDemoSeeded } = await import("@/lib/seed");
  await ensureDemoSeeded();

  const seeded = await getByUsername("demo");
  if (!seeded) {
    throw new Error("Demo creator could not be seeded");
  }
  return seeded;
}

export async function updateTipPageSettings(
  id: string,
  settings: Partial<TipPageSettings>,
): Promise<Creator | null> {
  const creator = await getById(id);
  if (!creator) return null;
  return update(id, {
    tipPageSettings: { ...creator.tipPageSettings, ...settings },
  });
}
