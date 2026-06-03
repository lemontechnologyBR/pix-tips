import { ChatBotEditor } from "@/components/dashboard/ChatBotEditor";
import { getCurrentCreator } from "@/lib/auth";
import { isChatBotConfigured } from "@/lib/chat-bot/repository";
import { resolveTwitchLogin, hasTwitchOAuth } from "@/lib/chat-bot/twitch-channel";
import { tipPageUrl } from "@/lib/brand";
import { getSessionFromCookies } from "@/lib/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatBot",
};

export default async function ChatBotPage() {
  const creator = await getCurrentCreator();
  const session = await getSessionFromCookies();

  const twitchConnected = session
    ? await hasTwitchOAuth(session.userId)
    : false;
  const resolvedChannel = session
    ? await resolveTwitchLogin(session.userId)
    : null;

  const profile = {
    settings: creator.chatBotSettings,
    twitchConnected,
    twitchChannel: creator.chatBotSettings.twitchChannel ?? resolvedChannel,
    botConfigured: isChatBotConfigured(),
    botUsername: process.env.TWITCH_BOT_USERNAME?.trim() ?? null,
    tipPageUrl: tipPageUrl(creator.username),
  };

  return (
    <ChatBotEditor
      initialProfile={structuredClone(profile)}
      username={creator.username}
      displayName={creator.displayName}
    />
  );
}
