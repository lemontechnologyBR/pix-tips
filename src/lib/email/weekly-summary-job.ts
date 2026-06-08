import { getPrisma } from "@/lib/db";
import { sendEmail } from "./email-client";
import { weeklySummaryEmail } from "./templates/weekly-summary";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function periodLabel(): string {
  const end = new Date();
  const start = new Date(end.getTime() - WEEK_MS);
  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${fmt(start)} a ${fmt(end)}`;
}

export async function runWeeklySummaryJob(): Promise<{
  sent: number;
  skipped: number;
  errors: number;
}> {
  const db = getPrisma();
  const since = new Date(Date.now() - WEEK_MS);
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  const creators = await db.creator.findMany({
    where: { notifyEmailWeekly: true, isSuspended: false },
    include: { user: { select: { email: true } } },
  });

  const label = periodLabel();

  for (const creator of creators) {
    const email = creator.user.email;
    if (!email) {
      skipped++;
      continue;
    }

    const transactions = await db.transaction.findMany({
      where: {
        creatorId: creator.id,
        status: "confirmed",
        createdAt: { gte: since },
      },
      orderBy: { amount: "desc" },
    });

    if (transactions.length === 0) {
      skipped++;
      continue;
    }

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const top = transactions[0];
    const topDonor = top.anonymous ? "Anônimo" : top.donorName;

    try {
      const { subject, html } = weeklySummaryEmail({
        creatorName: creator.displayName,
        periodLabel: label,
        totalAmount,
        donationCount: transactions.length,
        topDonor,
        topDonationAmount: top.amount,
      });

      const result = await sendEmail({ to: email, subject, html });
      if (result.ok) sent++;
      else errors++;
    } catch (err) {
      console.error("[weekly-summary] erro:", creator.id, err);
      errors++;
    }
  }

  return { sent, skipped, errors };
}
