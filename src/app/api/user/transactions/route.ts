import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getTransactions } from "@/lib/store";
import type { TransactionFilters } from "@/types";

export async function GET(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const filters: TransactionFilters = {
    period: (searchParams.get("period") as TransactionFilters["period"]) ?? "30",
    status:
      (searchParams.get("status") as TransactionFilters["status"]) ?? "all",
    method: (searchParams.get("method") as TransactionFilters["method"]) ?? "all",
    search: searchParams.get("search") ?? "",
    page: parseInt(searchParams.get("page") ?? "1", 10),
    limit: parseInt(searchParams.get("limit") ?? "20", 10),
  };

  const result = await getTransactions(session.creator.id, filters);
  return NextResponse.json(result);
}
