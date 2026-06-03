import { NextResponse } from "next/server";
import { getTwitchViewersForCreator } from "@/lib/twitch/viewers";
import { getCreatorById } from "@/lib/store";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { userId } = await params;
  const token = new URL(request.url).searchParams.get("token");

  const creator = await getCreatorById(userId);
  if (!creator || !token || creator.widgetToken !== token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const result = await getTwitchViewersForCreator(userId);

  return NextResponse.json({
    viewers: result.viewers,
    live: result.live,
    channel: result.channel,
    mock: result.mock ?? false,
  });
}
