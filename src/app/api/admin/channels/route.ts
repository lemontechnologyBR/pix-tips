import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { getAdminStreamerChannels } from "@/lib/repositories/admin-channels-repository";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const search = searchParams.get("search") ?? "";
  const platform = searchParams.get("platform") ?? "all";
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  const data = await getAdminStreamerChannels({ page, search, platform, limit });
  return NextResponse.json(data);
}
