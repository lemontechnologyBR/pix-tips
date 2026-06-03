import { after, NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { sendSubscriptionConfirmedEmail } from "@/lib/email";
import { createProSubscriptionCharge, confirmSubscriptionPayment } from "@/lib/payments/subscription";
import type { ProPlanType } from "@/lib/payments/subscription";
import { getPrisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;

    const body = await request.json().catch(() => ({}));
    const annual = Boolean(body.annual);
    const planType: ProPlanType = annual ? "pro_annual" : "pro_monthly";

    const checkout = await createProSubscriptionCharge(session.creator.id, planType);

    // Em modo mock (sem Woovi configurado), confirma imediatamente
    if (checkout.mock) {
      const payment = await confirmSubscriptionPayment(checkout.correlationID);
      if (!payment) {
        return NextResponse.json({ error: "Erro ao confirmar assinatura" }, { status: 500 });
      }

      const creator = await getPrisma().creator.findUnique({
        where: { id: session.creator.id },
        select: { displayName: true, user: { select: { email: true } } },
      });

      if (creator) {
        after(async () => {
          await sendSubscriptionConfirmedEmail(creator.user.email, {
            name: creator.displayName,
            amount: checkout.amount,
          }).catch(console.error);

        });
      }

      return NextResponse.json({ ok: true, mock: true, plan: "pro" });
    }

    return NextResponse.json({
      ok: true,
      mock: false,
      pixCode: checkout.pixCode,
      correlationID: checkout.correlationID,
      amount: checkout.amount,
      planType: checkout.planType,
    });
  } catch (err) {
    console.error("[billing/subscribe]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
