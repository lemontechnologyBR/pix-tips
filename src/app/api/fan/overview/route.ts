import { NextResponse } from "next/server";
import { getFanAccountOverview } from "@/lib/fan-account";
import {
  isUserSessionError,
  requireUserSession,
} from "@/lib/auth/require-session";

export async function GET() {
  const session = await requireUserSession();
  if (isUserSessionError(session)) return session;

  try {
    const overview = await getFanAccountOverview(session.userId);
    if (!overview) {
      return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ overview });
  } catch (error) {
    console.error("[fan/overview]", error);
    return NextResponse.json({ error: "Erro ao carregar conta." }, { status: 500 });
  }
}
