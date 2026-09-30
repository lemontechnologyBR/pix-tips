import { getIO } from "@/lib/socket-server";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { sendDonationReceivedEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/format";
import { createNotification } from "@/lib/notifications/service";
import { getCreatorById } from "@/lib/store";
import { findActiveSubscriber } from "@/lib/fan-subscriptions";
import {
  applyTipToFanMissions,
  fanKeyFromDonor,
  getCompletedMissionBadges,
} from "@/lib/fan-missions";
import type { DonationPayload, Transaction } from "@/types";

export async function emitDonationAlert(
  transaction: Transaction,
  overrideTtsVoiceId?: string,
) {
  const creator = await getCreatorById(transaction.creatorId);
  if (!creator) return;

  const normalize = (v?: string | null) => (v && v !== "off" ? v : undefined);

  const donorVoice =
    normalize(overrideTtsVoiceId) ??
    normalize(transaction.donorTtsVoiceId);

  const ttsEnabled = creator.alertSettings.ttsEnabled || donorVoice != null;
  const ttsVoiceId = donorVoice ?? creator.alertSettings.ttsVoiceId;

  const displayName = transaction.anonymous ? "Anônimo" : transaction.donorName;

  let isSubscriber = false;
  let subscriberPlanName: string | undefined;
  let missionBadges: string[] = [];

  if (transaction.kind !== "subscription") {
    try {
      const sub = await findActiveSubscriber(transaction.creatorId, {
        userId: transaction.donorUserId,
        name: transaction.anonymous ? null : transaction.donorName,
      });
      if (sub) {
        isSubscriber = true;
        subscriberPlanName = sub.planName;
      }
    } catch (err) {
      console.error("[emit-donation] subscriber lookup", err);
    }

    try {
      const { newlyCompletedBadges } = await applyTipToFanMissions({
        creatorId: transaction.creatorId,
        amount: transaction.amount,
        donorUserId: transaction.donorUserId,
        donorName: transaction.anonymous ? null : transaction.donorName,
      });
      const fanKey = fanKeyFromDonor({
        userId: transaction.donorUserId,
        name: transaction.anonymous ? null : transaction.donorName,
      });
      const allBadges = await getCompletedMissionBadges(
        transaction.creatorId,
        fanKey,
      );
      missionBadges = [...new Set([...allBadges, ...newlyCompletedBadges])];
    } catch (err) {
      console.error("[emit-donation] missions", err);
    }
  }

  const payload: DonationPayload = {
    name: displayName,
    amount: transaction.amount,
    message: transaction.message,
    templateId: creator.alertSettings.templateId,
    soundId: resolveAlertSoundId(
      creator.alertSettings.soundId,
      creator.alertSettings.soundUrl,
    ),
    soundUrl: creator.alertSettings.soundUrl,
    textConfig: creator.alertSettings.textConfig,
    backgroundMedia: creator.alertSettings.backgroundMedia,
    ttsEnabled,
    ttsVoiceId,
    ttsTemplate: creator.alertSettings.ttsTemplate,
    isSubscriber,
    subscriberPlanName,
    missionBadges: missionBadges.length ? missionBadges : undefined,
  };

  const io = getIO();
  const alertsNs = io.of("/alerts");

  alertsNs.to(transaction.creatorId).emit("new-donation", payload);
  alertsNs
    .to(`tx:${transaction.id}`)
    .emit("payment-confirmed", { transactionId: transaction.id });

  if (creator.notifyEmailDonation && creator.email) {
    try {
      await sendDonationReceivedEmail(creator.email, {
        creatorName: creator.displayName,
        donorName: displayName,
        amount: transaction.amount,
        message: transaction.message,
      });
    } catch (err) {
      console.error("[emit-donation] email error:", err);
    }
  }

  if (creator.notifyPanelDonation) {
    try {
      const badge =
        isSubscriber
          ? " (assinante)"
          : missionBadges.length
            ? ` [${missionBadges[0]}]`
            : "";
      await createNotification(transaction.creatorId, {
        type: "donation",
        title: "Nova doação!",
        body: `${displayName}${badge} doou ${formatCurrency(transaction.amount)}`,
      });
    } catch (err) {
      console.error("[emit-donation] notification error:", err);
    }
  }

  try {
    const { tryGrantDiscordRoleForDonation } = await import(
      "@/lib/integrations/discord-roles"
    );
    await tryGrantDiscordRoleForDonation({
      creatorId: transaction.creatorId,
      amount: transaction.amount,
      donorUserId: transaction.donorUserId,
    });
  } catch (err) {
    console.error("[emit-donation] discord role error:", err);
  }
}

export async function emitTestDonationAlert(creatorId: string): Promise<boolean> {
  const creator = await getCreatorById(creatorId);
  if (!creator) return false;

  const payload: DonationPayload = {
    name: "Fulano",
    amount: 10,
    message: "Teste na live",
    templateId: creator.alertSettings.templateId,
    soundId: resolveAlertSoundId(
      creator.alertSettings.soundId,
      creator.alertSettings.soundUrl,
    ),
    soundUrl: creator.alertSettings.soundUrl,
    textConfig: creator.alertSettings.textConfig,
    backgroundMedia: creator.alertSettings.backgroundMedia?.useBackgroundMedia
      ? creator.alertSettings.backgroundMedia
      : null,
    ttsEnabled: creator.alertSettings.ttsEnabled,
    ttsVoiceId: creator.alertSettings.ttsVoiceId,
    ttsTemplate: creator.alertSettings.ttsTemplate,
    isSubscriber: true,
    subscriberPlanName: "Apoio mensal",
    missionBadges: ["Fã"],
  };

  getIO().of("/alerts").to(creatorId).emit("new-donation", payload);
  return true;
}
