import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import {
  getUnreadCount,
  listNotifications,
  type NotificationFilter,
} from "@/lib/notifications/service";

const VALID_FILTERS: NotificationFilter[] = ["all", "donation", "system", "promo"];

export async function GET(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get("countOnly") === "1";

  if (countOnly) {
    const unreadCount = await getUnreadCount(session.creator.id);
    return NextResponse.json({ unreadCount });
  }

  const filterParam = searchParams.get("filter") ?? "all";
  const filter = VALID_FILTERS.includes(filterParam as NotificationFilter)
    ? (filterParam as NotificationFilter)
    : "all";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam, 10) || 10)) : undefined;

  const result = await listNotifications(session.creator.id, { filter, page, limit });
  return NextResponse.json(result);
}
