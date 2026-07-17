import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { ensureCreatorWooviSubaccounts } from "@/lib/payments/woovi-seller";

export async function POST() {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  try {
    const result = await ensureCreatorWooviSubaccounts();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao sincronizar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
