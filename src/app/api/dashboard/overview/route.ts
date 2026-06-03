import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getDashboardOverview } from "@/lib/store";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;
  const overview = await getDashboardOverview(session.creator.id);
  return NextResponse.json(overview);
}
