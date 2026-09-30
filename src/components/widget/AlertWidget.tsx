"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { DonationPayload, TextConfig } from "@/types";
import { DEFAULT_TEXT_CONFIG } from "@/types";
import { playCatalogSound, runWhenAudioUnlocked } from "@/lib/sounds";
import { speakText, resolveTtsTemplate } from "@/lib/tts";
import type { AlertControlAction } from "@/lib/alert-controls";
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
  paused: boolean;
  last: DonationPayload | null;
}

type AlertAction =
  | { type: "ENQUEUE"; payload: DonationPayload }
  | { type: "COMPLETE" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "SKIP" }
  | { type: "CLEAR" }
  | { type: "REPLAY" };

function alertReducer(state: AlertState, action: AlertAction): AlertState {
  switch (action.type) {
    case "ENQUEUE": {
      const last = action.payload;
      if (state.paused) {
        return { ...state, queue: [...state.queue, action.payload], last };
      }
      if (state.current) {
        return { ...state, queue: [...state.queue, action.payload], last };
      }
      return { ...state, current: action.payload, last };
    }
    case "COMPLETE": {
      if (state.paused) return state;
      if (state.queue.length === 0) {
        return { ...state, current: null };
      }
      const [next, ...rest] = state.queue;
      return { ...state, current: next, queue: rest };
    }
    case "PAUSE":
      return { ...state, paused: true };
    case "RESUME": {
      if (!state.paused) return state;
      if (state.current) return { ...state, paused: false };
      if (state.queue.length === 0) return { ...state, paused: false };
      const [next, ...rest] = state.queue;
      return { ...state, paused: false, current: next, queue: rest };
    }
    case "SKIP": {
      if (state.queue.length === 0) {
        return { ...state, current: null };
      }
      const [next, ...rest] = state.queue;
      return { ...state, current: next, queue: rest };
    }
    case "CLEAR":
      return { ...state, queue: [], current: null };
    case "REPLAY": {
      if (!state.last) return state;
      if (state.current) {
        return { ...state, queue: [state.last, ...state.queue] };
      }
      return { ...state, current: state.last };
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
    paused: false,
    last: null,
  });
  const pausedRef = useRef(false);
  pausedRef.current = state.paused;

  const handleComplete = useCallback(() => {
    if (pausedRef.current) return;
    dispatch({ type: "COMPLETE" });
  }, []);

  const enqueue = useCallback((payload: DonationPayload) => {
    dispatch({ type: "ENQUEUE", payload });
  }, []);

  const applyControl = useCallback((action: AlertControlAction) => {
    switch (action) {
      case "pause":
        dispatch({ type: "PAUSE" });
        break;
      case "resume":
        dispatch({ type: "RESUME" });
        break;
      case "skip":
        dispatch({ type: "SKIP" });
        break;
      case "clear":
        dispatch({ type: "CLEAR" });
        break;
      case "replay":
        dispatch({ type: "REPLAY" });
        break;
    }
  }, []);

  const currentAlert = state.current;
  const alertKey = currentAlert
    ? `${currentAlert.name}:${currentAlert.amount}:${currentAlert.templateId}:${state.paused}`
    : null;

  useEffect(() => {
    if (!currentAlert || state.paused) return;
    void playCatalogSound(currentAlert.soundId, currentAlert.soundUrl);

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (currentAlert.ttsEnabled && currentAlert.ttsVoiceId && currentAlert.ttsVoiceId !== "off") {
      const ttsText = resolveTtsTemplate(
        currentAlert.ttsTemplate ?? "{nome} doou {valor} reais. {mensagem}",
        currentAlert.name,
        currentAlert.amount,
        currentAlert.message,
      );
      timer = setTimeout(() => {
        void runWhenAudioUnlocked(async () => {
          if (cancelled) return;
          try {
            await speakText(ttsText, currentAlert.ttsVoiceId!);
          } catch (err) {
            console.warn("[alert-widget] TTS falhou:", err);
          }
        });
      }, 600);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [alertKey, currentAlert, state.paused]);

  useEffect(() => {
    if (previewMode) return;

    const socket: Socket = io("/alerts", {
      path: "/api/socket",
      auth: { userId, token },
    });

    socket.on("new-donation", (payload: DonationPayload) => {
      enqueue(payload);
    });
    socket.on("alert-control", (payload: { action?: AlertControlAction }) => {
      if (payload?.action) applyControl(payload.action);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, token, previewMode, enqueue, applyControl]);

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
      {currentAlert && !state.paused && (
        <AlertRenderer
          alert={currentAlert}
          duration={duration}
          textTemplate={textTemplate}
          textConfig={textConfig}
          onComplete={handleComplete}
          contained={previewMode}
        />
      )}
      {state.paused && currentAlert && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 rounded-full border border-amber-500/40 bg-zinc-950/90 px-3 py-1 text-[11px] text-amber-200">
          Fila pausada · {state.queue.length} na espera
        </div>
      )}

      {!previewMode && <WidgetAudioUnlock />}
    </div>
  );
}
