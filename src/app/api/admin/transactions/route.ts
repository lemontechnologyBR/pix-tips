import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { getAllTransactions } from "@/lib/repositories/admin-repository";
import type { TransactionFilters, TransactionStatus } from "@/types";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const filters: TransactionFilters = {
    period: (searchParams.get("period") as TransactionFilters["period"]) ?? "30",
    status: (searchParams.get("status") as TransactionStatus | "all") ?? "all",
    method: (searchParams.get("method") as TransactionFilters["method"]) ?? "all",
    search: searchParams.get("search") ?? "",
    page: parseInt(searchParams.get("page") ?? "1", 10),
    limit: parseInt(searchParams.get("limit") ?? "20", 10),
  };

  const result = await getAllTransactions(filters);
  return NextResponse.json(result);
}
