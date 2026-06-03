import { LeaderboardWidget } from "@/components/widget/LeaderboardWidget";
import { transactionToWidgetItem } from "@/lib/widget-items";
import { WidgetError } from "@/components/widget/WidgetError";
import {
  normalizeLeaderboardMaxItems,
  normalizeWidgetPosition,
} from "@/lib/widget-settings";
import { getCreatorById, getRecentDonations } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetLeaderboardPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { token } = await searchParams;
  const creator = await getCreatorById(userId);

  if (!creator || !token || creator.widgetToken !== token) {
    return <WidgetError />;
  }

  const maxItems = normalizeLeaderboardMaxItems(creator.alertSettings.leaderboardMaxItems);
  const recent = await getRecentDonations(userId, 50);
  const initialItems = recent.map(transactionToWidgetItem);

  return (
    <LeaderboardWidget
      userId={userId}
      token={token}
      initialItems={initialItems}
      position={normalizeWidgetPosition(creator.alertSettings.leaderboardPosition)}
      maxItems={maxItems}
      themeColor={creator.themeColor}
      title={creator.alertSettings.leaderboardTitle}
      period={creator.alertSettings.leaderboardPeriod}
      bgColor={creator.alertSettings.leaderboardBgColor}
      textColor={creator.alertSettings.leaderboardTextColor}
      fontSize={creator.alertSettings.leaderboardFontSize}
    />
  );
}
