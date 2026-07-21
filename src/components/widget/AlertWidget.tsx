"use client";

import { useCallback, useEffect, useReducer } from "react";
import { io, type Socket } from "socket.io-client";
import type { DonationPayload, TextConfig } from "@/types";
import { DEFAULT_TEXT_CONFIG } from "@/types";
import { playCatalogSound, runWhenAudioUnlocked } from "@/lib/sounds";
import { speakText, resolveTtsTemplate } from "@/lib/tts";
import { AlertRenderer } from "./AlertRenderer";
import { WidgetAudioUnlock } from "./WidgetAudioUnlock";

interface AlertWidgetProps {
  userId: string;
  token: string;
  duration?: number;
  textTemplate?: string;
  textConfig?: TextConfig;
  previewMode?: boolean;
}

interface AlertState {
  queue: DonationPayload[];
  current: DonationPayload | null;
}

type AlertAction =
  | { type: "ENQUEUE"; payload: DonationPayload }
  | { type: "COMPLETE" };

function alertReducer(state: AlertState, action: AlertAction): AlertState {
  switch (action.type) {
    case "ENQUEUE": {
      if (state.current) {
        return { ...state, queue: [...state.queue, action.payload] };
      }
      return { ...state, current: action.payload };
    }
    case "COMPLETE": {
      if (state.queue.length === 0) {
        return { ...state, current: null };
      }
      const [next, ...rest] = state.queue;
      return { current: next, queue: rest };
    }
    default:
      return state;
  }
}

export function AlertWidget({
  userId,
  token,
  duration = 6,
  textTemplate = "{nome} doou R$ {valor}!",
  textConfig = DEFAULT_TEXT_CONFIG,
  previewMode = false,
}: AlertWidgetProps) {
  const [state, dispatch] = useReducer(alertReducer, {
    queue: [],
    current: null,
  });

  const handleComplete = useCallback(() => {
    dispatch({ type: "COMPLETE" });
  }, []);

  const enqueue = useCallback((payload: DonationPayload) => {
    dispatch({ type: "ENQUEUE", payload });
  }, []);

  const currentAlert = state.current;
  const alertKey = currentAlert
    ? `${currentAlert.name}:${currentAlert.amount}:${currentAlert.templateId}`
    : null;

  useEffect(() => {
    if (!currentAlert) return;
    void playCatalogSound(currentAlert.soundId, currentAlert.soundUrl);

    if (currentAlert.ttsEnabled && currentAlert.ttsVoiceId && currentAlert.ttsVoiceId !== "off") {
      const ttsText = resolveTtsTemplate(
        currentAlert.ttsTemplate ?? "{nome} doou {valor} reais. {mensagem}",
        currentAlert.name,
        currentAlert.amount,
        currentAlert.message,
      );
      // Pequeno delay para não sobrepor o som do alerta. Se o áudio ainda
      // estiver bloqueado pelo navegador, a fala entra na fila de desbloqueio.
      const timer = setTimeout(
        () =>
          void runWhenAudioUnlocked(() =>
            speakText(ttsText, currentAlert.ttsVoiceId!),
          ),
        600,
      );
      return () => clearTimeout(timer);
    }
  }, [alertKey, currentAlert]);

  useEffect(() => {
    if (previewMode) return;

    const socket: Socket = io("/alerts", {
      path: "/api/socket",
      auth: { userId, token },
    });

    socket.on("new-donation", (payload: DonationPayload) => {
      enqueue(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, token, previewMode, enqueue]);

  useEffect(() => {
    if (!previewMode) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<DonationPayload>).detail;
      if (detail) enqueue(detail);
    };
    window.addEventListener("widget-test-alert", handler);
    return () => window.removeEventListener("widget-test-alert", handler);
  }, [previewMode, enqueue]);

  return (
    <div
      className={
        previewMode
          ? "pointer-events-none absolute inset-0"
          : "pointer-events-none fixed inset-0 z-[9998]"
      }
    >
      {currentAlert && (
        <AlertRenderer
          alert={currentAlert}
          duration={duration}
          textTemplate={textTemplate}
          textConfig={textConfig}
          onComplete={handleComplete}
          contained={previewMode}
        />
      )}

      {!previewMode && <WidgetAudioUnlock />}
    </div>
  );
}
