import { NextResponse } from "next/server";
import { normalizeViewersPlatforms } from "@/lib/streaming-platforms";
import { getCreatorById } from "@/lib/store";
import { getViewersForCreator } from "@/lib/viewers";

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

  const platforms = normalizeViewersPlatforms(creator.alertSettings.viewersPlatforms);
  const result = await getViewersForCreator(userId, platforms);

  return NextResponse.json(result);
}
