import { LastDonationWidget } from "@/components/widget/LastDonationWidget";
import { transactionToWidgetItem } from "@/lib/widget-items";
import { WidgetError } from "@/components/widget/WidgetError";
import { normalizeWidgetPosition } from "@/lib/widget-settings";
import { getCreatorById, getRecentDonations } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetLastPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { token } = await searchParams;
  const creator = await getCreatorById(userId);

  if (!creator || !token || creator.widgetToken !== token) {
    return <WidgetError />;
  }

  const recent = await getRecentDonations(userId, 1);
  const initialItem = recent[0] ? transactionToWidgetItem(recent[0]) : null;

  return (
    <LastDonationWidget
      userId={userId}
      token={token}
      initialItem={initialItem}
      position={normalizeWidgetPosition(creator.alertSettings.lastDonationPosition)}
      themeColor={creator.themeColor}
      layout={creator.alertSettings.lastDonationLayout}
      bgColor={creator.alertSettings.lastDonationBgColor}
      textColor={creator.alertSettings.lastDonationTextColor}
      fontSize={creator.alertSettings.lastDonationFontSize}
    />
  );
}
