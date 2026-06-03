import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { listAdminKyc } from "@/lib/repositories/kyc-repository";
import type { KycStatus } from "@/types";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "pending" ||
    statusParam === "approved" ||
    statusParam === "rejected"
      ? (statusParam as KycStatus)
      : undefined;

  const items = await listAdminKyc(status);
  return NextResponse.json({ items });
}
