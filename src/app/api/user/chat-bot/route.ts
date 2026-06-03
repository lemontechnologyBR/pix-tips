import { NextResponse } from "next/server";
import { tipPageUrl } from "@/lib/brand";
import { reloadTwitchChatBot, isTwitchChatBotConfigured } from "@/lib/chat-bot/twitch-bot";
import {
  getChatBotSettingsForCreator,
  updateChatBotSettings,
} from "@/lib/chat-bot/repository";
import { normalizeChatBotSettings } from "@/lib/chat-bot/settings";
import {
  hasTwitchOAuth,
  resolveTwitchLogin,
} from "@/lib/chat-bot/twitch-channel";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import type { ChatBotSettings } from "@/types";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const settings = await getChatBotSettingsForCreator(session.creator.id);
  if (!settings) {
    return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
  }

  const twitchConnected = await hasTwitchOAuth(session.userId);
  const resolvedChannel = twitchConnected
    ? await resolveTwitchLogin(session.userId)
    : null;

  return NextResponse.json({
    settings,
    twitchConnected,
    twitchChannel: settings.twitchChannel ?? resolvedChannel,
    botConfigured: isTwitchChatBotConfigured(),
    botUsername: process.env.TWITCH_BOT_USERNAME?.trim() ?? null,
    tipPageUrl: tipPageUrl(session.creator.username),
  });
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;

    const body = (await request.json()) as Partial<ChatBotSettings>;
    const current = await getChatBotSettingsForCreator(session.creator.id);
    if (!current) {
      return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
    }

    let twitchChannel = current.twitchChannel;

    if (body.enabled === true) {
      const connected = await hasTwitchOAuth(session.userId);
      if (!connected) {
        return NextResponse.json(
          {
            error:
              "Vincule sua conta Twitch em Configurações antes de ativar o bot.",
          },
          { status: 400 },
        );
      }

      const login = await resolveTwitchLogin(session.userId);
      if (!login) {
        return NextResponse.json(
          {
            error:
              "Não foi possível obter seu canal Twitch. Reconecte a conta em Configurações.",
          },
          { status: 400 },
        );
      }
      twitchChannel = login;
    }

    const merged = normalizeChatBotSettings({
      ...current,
      ...body,
      twitchChannel: body.enabled === false ? twitchChannel : twitchChannel,
    });

    const saved = await updateChatBotSettings(session.creator.id, merged);
    if (!saved) {
      return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
    }

    reloadTwitchChatBot();

    return NextResponse.json({ ok: true, settings: saved });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
