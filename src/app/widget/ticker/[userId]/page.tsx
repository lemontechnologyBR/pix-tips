import { TickerWidget } from "@/components/widget/TickerWidget";
import { transactionToWidgetItem } from "@/lib/widget-items";
import { WidgetError } from "@/components/widget/WidgetError";
import { normalizeTickerLayout, normalizeTickerMaxItems, normalizeWidgetPosition } from "@/lib/widget-settings";
import { getCreatorById, getRecentDonations } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetTickerPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { token } = await searchParams;
  const creator = await getCreatorById(userId);

  if (!creator || !token || creator.widgetToken !== token) {
    return <WidgetError />;
  }

  const recent = await getRecentDonations(
    userId,
    creator.alertSettings.tickerMaxItems,
  );
  const initialItems = recent.map(transactionToWidgetItem);

  return (
    <TickerWidget
      userId={userId}
      token={token}
      initialItems={initialItems}
      position={normalizeWidgetPosition(creator.alertSettings.tickerPosition)}
      layout={normalizeTickerLayout(creator.alertSettings.tickerLayout)}
      maxItems={normalizeTickerMaxItems(creator.alertSettings.tickerMaxItems)}
      themeColor={creator.themeColor}
      speed={creator.alertSettings.tickerSpeed}
      bgColor={creator.alertSettings.tickerBgColor}
      textColor={creator.alertSettings.tickerTextColor}
      fontSize={creator.alertSettings.tickerFontSize}
    />
  );
}
