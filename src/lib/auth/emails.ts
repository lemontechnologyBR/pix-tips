import {
  sendPasswordResetEmail as sendPasswordResetEmailFn,
  sendWelcomeEmail as sendWelcomeEmailFn,
} from "@/lib/email";

export async function sendWelcomeEmail(
  to: string,
  name: string,
  username: string,
): Promise<void> {
  await sendWelcomeEmailFn(to, { name, username });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
): Promise<void> {
  await sendPasswordResetEmailFn(to, { name, resetUrl });
}
