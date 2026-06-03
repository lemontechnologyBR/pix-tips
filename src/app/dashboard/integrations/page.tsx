import { IntegrationsContent } from "@/components/dashboard/IntegrationsContent";
import { getCurrentCreator } from "@/lib/auth";
import { getUserProfile } from "@/lib/store";
import { isChatBotConfigured } from "@/lib/chat-bot/repository";
import { hasTwitchOAuth, resolveTwitchLogin } from "@/lib/chat-bot/twitch-channel";
import { getSessionFromCookies } from "@/lib/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrações",
};

export default async function IntegrationsPage() {
  const creator = await getCurrentCreator();
  const profile = await getUserProfile(creator.id);
  const session = await getSessionFromCookies();

  const twitchChannel = session ? await resolveTwitchLogin(session.userId) : null;
  const botConfigured = isChatBotConfigured();

  return (
    <IntegrationsContent
      connectedAccounts={profile.connectedAccounts}
      hasPassword={profile.hasPassword}
      twitchChannel={twitchChannel}
      botConfigured={botConfigured}
    />
  );
}
