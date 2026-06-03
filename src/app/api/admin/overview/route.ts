import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { getAdminOverview } from "@/lib/repositories/admin-repository";

export async function GET() {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const overview = await getAdminOverview();
  return NextResponse.json(overview);
}
