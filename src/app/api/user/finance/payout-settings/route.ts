import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { isValidPixKey } from "@/lib/finance";
import { updatePayoutSettings } from "@/lib/store";
import type { PixKeyType } from "@/types";

export async function PUT(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  try {
    const body = (await request.json()) as {
      pixKey?: string;
      pixKeyType?: PixKeyType;
      pixHolderName?: string;
    };

    const pixKey = body.pixKey?.trim() ?? "";
    const pixKeyType = body.pixKeyType ?? "email";
    const pixHolderName = body.pixHolderName?.trim() ?? "";

    if (!pixHolderName) {
      return NextResponse.json(
        { error: "Informe o nome do titular da conta" },
        { status: 400 },
      );
    }

    if (!isValidPixKey(pixKey, pixKeyType)) {
      return NextResponse.json(
        { error: "Chave Pix inválida para o tipo selecionado" },
        { status: 400 },
      );
    }

    await updatePayoutSettings(session.creator.id, {
      pixKey,
      pixKeyType,
      pixHolderName,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar dados bancários" }, { status: 500 });
  }
}
