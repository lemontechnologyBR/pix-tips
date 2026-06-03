import { StatsWidget } from "@/components/widget/StatsWidget";
import { WidgetError } from "@/components/widget/WidgetError";
import { normalizeWidgetPosition } from "@/lib/widget-settings";
import { getCreatorById } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetStatsPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { token } = await searchParams;
  const creator = await getCreatorById(userId);

  if (!creator || !token || creator.widgetToken !== token) {
    return <WidgetError />;
  }

  return (
    <StatsWidget
      userId={userId}
      token={token}
      position={normalizeWidgetPosition(creator.alertSettings.statsPosition)}
      themeColor={creator.themeColor}
      layout={creator.alertSettings.statsLayout}
      label={creator.alertSettings.statsLabel}
      countLabel={creator.alertSettings.statsCountLabel}
      bgColor={creator.alertSettings.statsBgColor}
      textColor={creator.alertSettings.statsTextColor}
      fontSize={creator.alertSettings.statsFontSize}
    />
  );
}
