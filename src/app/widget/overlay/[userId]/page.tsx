import { UnifiedOverlayWidget } from "@/components/widget/UnifiedOverlayWidget";
import { WidgetError } from "@/components/widget/WidgetError";
import { transactionToWidgetItem } from "@/lib/widget-items";
import { getCreatorById, getRecentDonations } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetOverlayPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { token } = await searchParams;
  const creator = await getCreatorById(userId);

  if (!creator || !token || creator.widgetToken !== token) {
    return <WidgetError />;
  }

  const maxItems = Math.max(
    creator.alertSettings.tickerMaxItems,
    creator.alertSettings.supportersMaxItems,
    creator.alertSettings.leaderboardMaxItems,
    10,
  );
  const recent = await getRecentDonations(userId, maxItems);
  const initialItems = recent.map(transactionToWidgetItem);

  return (
    <UnifiedOverlayWidget
      userId={userId}
      token={token}
      goal={creator.goal}
      raised={creator.raised}
      goalTitle={creator.tipPageSettings.goalTitle}
      themeColor={creator.themeColor}
      alertSettings={creator.alertSettings}
      initialItems={initialItems}
    />
  );
}
