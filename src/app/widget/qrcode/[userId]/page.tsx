import { QrCodeWidget } from "@/components/widget/QrCodeWidget";
import { WidgetError } from "@/components/widget/WidgetError";
import { tipPageUrl } from "@/lib/brand";
import { normalizeQrCodeSettings } from "@/lib/qr-code-defaults";
import { getCreatorById } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetQrCodePage({
  params,
  searchParams,
}: PageProps) {
  const { userId } = await params;
  const { token } = await searchParams;
  const creator = await getCreatorById(userId);

  if (!creator || !token || creator.widgetToken !== token) {
    return <WidgetError />;
  }

  const qrSettings = normalizeQrCodeSettings(creator.tipPageSettings.qrCodeSettings);
  const pageUrl = tipPageUrl(creator.username);
  const displayUrl = pageUrl.replace(/^https?:\/\//, "");

  return (
    <QrCodeWidget
      pageUrl={pageUrl}
      displayUrl={displayUrl}
      settings={qrSettings}
      avatarUrl={creator.avatar}
      plan={creator.plan}
    />
  );
}
