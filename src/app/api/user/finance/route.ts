import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getFinanceOverview } from "@/lib/store";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  try {
    const overview = await getFinanceOverview(session.creator.id);
    return NextResponse.json(overview);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar financeiro" }, { status: 500 });
  }
}
