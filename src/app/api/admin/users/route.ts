import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { listAllUsers } from "@/lib/repositories/admin-repository";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const search = searchParams.get("search") ?? "";
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const statusParam = searchParams.get("status") ?? "active";
  const status =
    statusParam === "suspended" || statusParam === "all" || statusParam === "active"
      ? statusParam
      : "active";

  const result = await listAllUsers({ page, search, limit, status });
  return NextResponse.json(result);
}
