import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { listPayouts } from "@/lib/store";

export async function GET(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "30";
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  const result = await listPayouts(session.creator.id, { period, limit });
  return NextResponse.json(result);
}
