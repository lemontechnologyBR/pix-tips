import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import {
  getWooviConnectionStatus,
  isWooviSplitConfigured,
} from "@/lib/payments/woovi-seller";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const status = await getWooviConnectionStatus(session.creator.id);

  return NextResponse.json({
    splitEnabled: isWooviSplitConfigured(),
    connected: status.connected,
    pixKeyMasked: status.pixKeyMasked,
    pixKeyType: status.pixKeyType,
    subaccountName: status.subaccountName,
    wooviSubaccountLabel: status.wooviSubaccountLabel,
    subaccountBalance: status.balanceCents / 100,
    withdrawBlocked: status.withdrawBlocked,
  });
}
