import { AlertWidget } from "@/components/widget/AlertWidget";
import { TestControls } from "@/components/widget/TestControls";
import { WidgetError } from "@/components/widget/WidgetError";
import { getCreatorById } from "@/lib/store";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function WidgetTestPage({
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
    <div className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-xl font-bold">Teste de Widget</h1>
        <TestControls
          userId={userId}
          token={token}
          defaultTemplate={creator.alertSettings.templateId}
          backgroundMedia={creator.alertSettings.backgroundMedia}
        />
        <div className="widget-preview-container relative overflow-hidden rounded-xl border border-zinc-800 bg-black aspect-video">
          <p className="absolute right-3 top-3 text-xs text-zinc-600">Miniatura OBS</p>
          <AlertWidget
            userId={userId}
            token={token}
            duration={creator.alertSettings.duration}
            textTemplate={creator.alertSettings.textTemplate}
            textConfig={creator.alertSettings.textConfig}
            previewMode
          />
        </div>
      </div>
    </div>
  );
}
