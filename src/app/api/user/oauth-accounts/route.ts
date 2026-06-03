import { NextResponse } from "next/server";
import { listOAuthAccounts } from "@/lib/auth/oauth";
import { isSessionError, requireSession } from "@/lib/auth/require-session";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const accounts = await listOAuthAccounts(session.userId);

  return NextResponse.json({
    accounts: accounts.map((account) => ({
      provider: account.provider,
      createdAt: account.createdAt.toISOString(),
    })),
  });
}
