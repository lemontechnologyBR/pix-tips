import { SupportersWidget } from "@/components/widget/SupportersWidget";
import { transactionToWidgetItem } from "@/lib/widget-items";
import { WidgetError } from "@/components/widget/WidgetError";
import {
  normalizeSupportersMaxItems,
  normalizeWidgetPosition,
} from "@/lib/widget-settings";
import { getCreatorById, getRecentDonations } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetSupportersPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { token } = await searchParams;
  const creator = await getCreatorById(userId);

  if (!creator || !token || creator.widgetToken !== token) {
    return <WidgetError />;
  }

  const recent = await getRecentDonations(
    userId,
    creator.alertSettings.supportersMaxItems,
  );
  const initialItems = recent.map(transactionToWidgetItem);

  return (
    <SupportersWidget
      userId={userId}
      token={token}
      initialItems={initialItems}
      position={normalizeWidgetPosition(creator.alertSettings.supportersPosition)}
      maxItems={normalizeSupportersMaxItems(creator.alertSettings.supportersMaxItems)}
      themeColor={creator.themeColor}
      title={creator.alertSettings.supportersTitle}
      layout={creator.alertSettings.supportersLayout}
      bgColor={creator.alertSettings.supportersBgColor}
      textColor={creator.alertSettings.supportersTextColor}
      fontSize={creator.alertSettings.supportersFontSize}
    />
  );
}
