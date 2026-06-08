import { getIO } from "@/lib/socket-server";
import { resolveAlertSoundId } from "@/lib/alert-catalog";
import { sendDonationReceivedEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/format";
import { createNotification } from "@/lib/notifications/service";
import { forwardDonationToIntegrations } from "@/lib/integrations/forward-donation";
import { getCreatorById } from "@/lib/store";
import type { DonationPayload, Transaction } from "@/types";

export async function emitDonationAlert(
  transaction: Transaction,
  overrideTtsVoiceId?: string,
) {
  const creator = await getCreatorById(transaction.creatorId);
  if (!creator) return;

  // Prioridade: argumento explícito → salvo na transação → configuração do criador
  // Ignorar vozes "off" ou em branco em todos os níveis
  const normalize = (v?: string | null) => (v && v !== "off" ? v : undefined);

  const donorVoice =
    normalize(overrideTtsVoiceId) ??
    normalize(transaction.donorTtsVoiceId);

  // TTS ativado quando: criador habilitou OR doador escolheu uma voz
  const ttsEnabled = creator.alertSettings.ttsEnabled || (donorVoice != null);
  const ttsVoiceId = donorVoice ?? creator.alertSettings.ttsVoiceId;

  const payload: DonationPayload = {
    name: transaction.anonymous ? "Anônimo" : transaction.donorName,
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
  };

  const io = getIO();
  const alertsNs = io.of("/alerts");

  alertsNs.to(transaction.creatorId).emit("new-donation", payload);
  alertsNs
    .to(`tx:${transaction.id}`)
    .emit("payment-confirmed", { transactionId: transaction.id });

  try {
    await forwardDonationToIntegrations(transaction.creatorId, transaction);
  } catch (err) {
    console.error("[emit-donation] integration error:", err);
  }

  if (creator.notifyEmailDonation && creator.email) {
    try {
      await sendDonationReceivedEmail(creator.email, {
        creatorName: creator.displayName,
        donorName: transaction.anonymous ? "Anônimo" : transaction.donorName,
        amount: transaction.amount,
        message: transaction.message,
      });
    } catch (err) {
      console.error("[emit-donation] email error:", err);
    }
  }

  if (creator.notifyPanelDonation) {
    const donorName = transaction.anonymous ? "Anônimo" : transaction.donorName;
    try {
      await createNotification(transaction.creatorId, {
        type: "donation",
        title: "Nova doação!",
        body: `${donorName} doou ${formatCurrency(transaction.amount)}`,
      });
    } catch (err) {
      console.error("[emit-donation] notification error:", err);
    }
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
  };

  getIO().of("/alerts").to(creatorId).emit("new-donation", payload);
  return true;
}
