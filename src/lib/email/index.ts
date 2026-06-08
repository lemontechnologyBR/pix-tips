import { sendEmail } from "./email-client";
import { donationReceivedEmail } from "./templates/donation-received";
import { marketingUpdateEmail } from "./templates/marketing-update";
import { passwordResetEmail } from "./templates/password-reset";
import { welcomeEmail } from "./templates/welcome";

export { sendEmail } from "./email-client";
export { syncMarketingContact } from "./resend-audience";
export { runWeeklySummaryJob } from "./weekly-summary-job";

export async function sendWelcomeEmail(
  to: string,
  data: { name: string; username: string },
): Promise<void> {
  const { subject, html } = welcomeEmail(data);
  await sendEmail({ to, subject, html });
}

export async function sendPasswordResetEmail(
  to: string,
  data: { name: string; resetUrl: string },
): Promise<void> {
  const { subject, html } = passwordResetEmail(data);
  await sendEmail({ to, subject, html });
}

export async function sendDonationReceivedEmail(
  to: string,
  data: {
    creatorName: string;
    donorName: string;
    amount: number;
    message?: string;
  },
): Promise<void> {
  const { subject, html } = donationReceivedEmail(data);
  await sendEmail({ to, subject, html });
}

export async function sendMarketingUpdateEmail(
  to: string,
  data: { name: string; headline: string; bodyHtml: string },
): Promise<void> {
  const { subject, html } = marketingUpdateEmail(data);
  await sendEmail({ to, subject, html });
}
