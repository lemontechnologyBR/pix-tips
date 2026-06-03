import { ViewersWidget } from "@/components/widget/ViewersWidget";
import { WidgetError } from "@/components/widget/WidgetError";
import { normalizeViewersOverlayLayout } from "@/lib/viewers-overlay-layout";
import { normalizeViewersPlatforms } from "@/lib/streaming-platforms";
import { normalizeWidgetPosition } from "@/lib/widget-settings";
import { resolveDragPoint } from "@/lib/overlay-drag-position";
import { getCreatorById } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetViewersPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { token } = await searchParams;
  const creator = await getCreatorById(userId);

  if (!creator || !token || creator.widgetToken !== token) {
    return <WidgetError />;
  }

  const drag = creator.alertSettings.overlayDragPositions;

  return (
    <ViewersWidget
      userId={userId}
      token={token}
      layout={normalizeViewersOverlayLayout(creator.alertSettings.viewersLayout)}
      platforms={normalizeViewersPlatforms(creator.alertSettings.viewersPlatforms)}
      position={normalizeWidgetPosition(creator.alertSettings.viewersPosition)}
      dragPosition={resolveDragPoint(
        drag,
        "viewers",
        creator.alertSettings.viewersPosition,
      )}
      themeColor={creator.themeColor}
    />
  );
}
