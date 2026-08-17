import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { getAdminTrafficAnalytics } from "@/lib/repositories/admin-analytics-repository";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? "30");
  const creator = searchParams.get("creator") ?? "";

  const data = await getAdminTrafficAnalytics(days, { creator });
  return NextResponse.json(data);
}
