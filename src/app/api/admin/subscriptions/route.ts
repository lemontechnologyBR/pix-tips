import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";

/** Plano Pro desativado. */
export async function GET() {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;
  return NextResponse.json(
    { error: "Assinaturas Pro não estão disponíveis." },
    { status: 410 },
  );
}
