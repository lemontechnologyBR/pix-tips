import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
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
    const patch: Record<string, boolean> = {};

    if (typeof body.notifyEmailDonation === "boolean") {
      patch.notifyEmailDonation = body.notifyEmailDonation;
    }
    if (typeof body.notifyEmailWeekly === "boolean") {
      patch.notifyEmailWeekly = body.notifyEmailWeekly;
    }
    if (typeof body.notifyPanelDonation === "boolean") {
      patch.notifyPanelDonation = body.notifyPanelDonation;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "Nenhuma preferência válida para salvar." },
        { status: 400 },
      );
    }

    await updateCreator(session.creator.id, patch);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
