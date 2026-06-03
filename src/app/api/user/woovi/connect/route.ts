import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import {
  connectWooviPixKey,
  isWooviSplitConfigured,
  WooviApiError,
  WooviPixKeyLinkedError,
  WooviPixKeyLimitError,
} from "@/lib/payments/woovi-seller";
import type { PixKeyType } from "@/types";

export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  if (!isWooviSplitConfigured()) {
    return NextResponse.json(
      { error: "Recebimentos Pix ainda não disponíveis na plataforma." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      pixKey?: string;
      pixKeyType?: PixKeyType;
    };

    const pixKey = body.pixKey?.trim() ?? "";
    const pixKeyType = body.pixKeyType ?? "email";

    if (!pixKey) {
      return NextResponse.json(
        { error: "Informe sua chave Pix para receber doações." },
        { status: 400 },
      );
    }

    await connectWooviPixKey(session.creator.id, { pixKey, pixKeyType });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof WooviPixKeyLinkedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof WooviPixKeyLimitError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof WooviApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao cadastrar chave Pix." },
      { status: 500 },
    );
  }
}
