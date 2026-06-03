import { AlertWidget } from "@/components/widget/AlertWidget";
import { WidgetError } from "@/components/widget/WidgetError";
import { getCreatorById } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetAlertPage({
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
    <AlertWidget
      userId={userId}
      token={token}
      duration={creator.alertSettings.duration}
      textTemplate={creator.alertSettings.textTemplate}
      textConfig={creator.alertSettings.textConfig}
    />
  );
}
