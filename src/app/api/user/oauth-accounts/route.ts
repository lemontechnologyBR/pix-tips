import { NextResponse } from "next/server";
import { listOAuthAccounts } from "@/lib/auth/oauth";
import {
  isUserSessionError,
  requireUserSession,
} from "@/lib/auth/require-session";

export async function GET() {
  const session = await requireUserSession();
  if (isUserSessionError(session)) return session;

  const accounts = await listOAuthAccounts(session.userId);
  const payload = {
    accounts: accounts.map((account) => {
      return {
        provider: account.provider,
        createdAt: account.createdAt.toISOString(),
      };
    }),
  };
  return NextResponse.json(payload);
}
