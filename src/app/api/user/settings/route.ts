import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { syncMarketingContact } from "@/lib/email/resend-audience";
import { getPrisma } from "@/lib/db";
import { updateCreator } from "@/lib/store";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { getUserProfile } = await import("@/lib/store");
  const profile = await getUserProfile(session.creator.id);
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;

    const body = await request.json();
    const creatorPatch: Record<string, boolean> = {};
    let marketingOptIn: boolean | undefined;

    if (typeof body.notifyEmailDonation === "boolean") {
      creatorPatch.notifyEmailDonation = body.notifyEmailDonation;
    }
    if (typeof body.notifyEmailWeekly === "boolean") {
      creatorPatch.notifyEmailWeekly = body.notifyEmailWeekly;
    }
    if (typeof body.notifyPanelDonation === "boolean") {
      creatorPatch.notifyPanelDonation = body.notifyPanelDonation;
    }
    if (typeof body.marketingOptIn === "boolean") {
      marketingOptIn = body.marketingOptIn;
    }

    if (Object.keys(creatorPatch).length === 0 && marketingOptIn === undefined) {
      return NextResponse.json(
        { error: "Nenhuma preferência válida para salvar." },
        { status: 400 },
      );
    }

    if (Object.keys(creatorPatch).length > 0) {
      await updateCreator(session.creator.id, creatorPatch);
    }

    if (marketingOptIn !== undefined) {
      const db = getPrisma();
      const user = await db.user.update({
        where: { id: session.userId },
        data: {
          marketingOptIn,
          marketingOptInAt: marketingOptIn ? new Date() : null,
        },
        select: { email: true, name: true },
      });

      await syncMarketingContact(user.email, user.name, marketingOptIn).catch(
        console.error,
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
