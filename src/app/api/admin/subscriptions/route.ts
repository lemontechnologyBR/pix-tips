import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { listAllSubscriptions } from "@/lib/repositories/admin-repository";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") ?? "all";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  const validStatuses = ["all", "paid", "pending"];
  const status = validStatuses.includes(statusParam) ? statusParam : "all";

  const result = await listAllSubscriptions({ status, page, limit });
  return NextResponse.json(result);
}
