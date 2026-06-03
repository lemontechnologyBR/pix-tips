import { WidgetsDashboard } from "@/components/dashboard/WidgetsDashboard";
import { getCurrentCreator } from "@/lib/auth";
import { getSessionFromCookies } from "@/lib/auth/session";
import { resolveTwitchLogin, hasTwitchOAuth } from "@/lib/chat-bot/twitch-channel";
import { normalizeTipPageSettings } from "@/lib/tip-page-defaults";
import { buildWidgetUrls } from "@/lib/widget-urls";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widgets",
};

export default async function WidgetsPage() {
  const creator = await getCurrentCreator();
  const session = await getSessionFromCookies();

  const twitchConnected = session ? await hasTwitchOAuth(session.userId) : false;
  const resolvedChannel = session ? await resolveTwitchLogin(session.userId) : null;

  const normalized = {
    ...creator,
    tipPageSettings: normalizeTipPageSettings(creator.tipPageSettings),
  };

  const widgetUrls = buildWidgetUrls(creator.id, creator.widgetToken);

  return (
    <WidgetsDashboard
      creator={structuredClone(normalized)}
      widgetUrls={widgetUrls}
      twitchConnected={twitchConnected}
      twitchChannel={creator.chatBotSettings.twitchChannel ?? resolvedChannel}
    />
  );
}
