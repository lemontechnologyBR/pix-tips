import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { getAdminOpsSnapshot } from "@/lib/repositories/admin-ops-repository";

export async function GET() {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;
  const snapshot = await getAdminOpsSnapshot();
  return NextResponse.json(snapshot);
}
