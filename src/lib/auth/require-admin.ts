import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import * as userRepo from "@/lib/repositories/user-repository";

export interface AdminSession {
  userId: string;
  email: string;
}

export async function requireAdminSession(): Promise<
  AdminSession | NextResponse
> {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await userRepo.findById(session.userId);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  return { userId: session.userId, email: session.email };
}

export function isAdminSessionError(
  result: AdminSession | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
