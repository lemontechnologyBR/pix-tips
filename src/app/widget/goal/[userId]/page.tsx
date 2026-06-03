import { GoalWidget } from "@/components/widget/GoalWidget";
import { WidgetError } from "@/components/widget/WidgetError";
import { normalizeGoalOverlayLayout } from "@/lib/goal-overlay-layout";
import { normalizeGoalOverlayPosition } from "@/lib/goal-overlay-position";
import { getCreatorById } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetGoalPage({
  params,
  searchParams,
}: PageProps) {
  const { userId } = await params;
  const { token } = await searchParams;
  const creator = await getCreatorById(userId);

  if (!creator || !token || creator.widgetToken !== token) {
    return <WidgetError />;
  }

  return (
    <GoalWidget
      userId={userId}
      token={token}
      goal={creator.goal}
      raised={creator.raised}
      goalTitle={creator.tipPageSettings.goalTitle}
      themeColor={creator.themeColor}
      goalOverlayPosition={normalizeGoalOverlayPosition(
        creator.alertSettings.goalOverlayPosition,
      )}
      goalOverlayLayout={normalizeGoalOverlayLayout(
        creator.alertSettings.goalOverlayLayout,
      )}
      barColor={creator.alertSettings.goalBarColor}
      bgColor={creator.alertSettings.goalBgColor}
      textColor={creator.alertSettings.goalTextColor}
      showPercentage={creator.alertSettings.goalShowPercentage}
      showValues={creator.alertSettings.goalShowValues}
      fontSize={creator.alertSettings.goalFontSize}
    />
  );
}
