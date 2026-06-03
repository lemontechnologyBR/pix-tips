import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { emitTestDonationAlert } from "@/lib/emit-donation";
import { updateCreator } from "@/lib/store";
import type { AlertSettings } from "@/types";
import { normalizeAlertSettings } from "@/lib/repositories/json-fields";

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;
    const { creator } = session;

    const body = (await request.json()) as Partial<AlertSettings>;
    const merged: Partial<AlertSettings> = { ...creator.alertSettings, ...body };
    const normalized = normalizeAlertSettings(merged);

    await updateCreator(creator.id, { alertSettings: normalized });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

export async function POST() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const ok = await emitTestDonationAlert(session.creator.id);
  if (!ok) {
    return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
