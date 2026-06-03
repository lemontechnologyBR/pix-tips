import { sendEmail } from "./email-client";
import { donationReceivedEmail } from "./templates/donation-received";
import { passwordResetEmail } from "./templates/password-reset";
import { subscriptionConfirmedEmail } from "./templates/subscription-confirmed";
import { welcomeEmail } from "./templates/welcome";

export { sendEmail } from "./email-client";

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

export async function sendSubscriptionConfirmedEmail(
  to: string,
  data: { name: string; amount?: number },
): Promise<void> {
  const { subject, html } = subscriptionConfirmedEmail(data);
  await sendEmail({ to, subject, html });
}
