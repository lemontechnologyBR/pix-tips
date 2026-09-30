"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { AlertControlAction } from "@/lib/alert-controls";

interface AlertLiveControlsProps {
  userId: string;
  token: string;
}

const ACTIONS: { action: AlertControlAction; label: string }[] = [
  { action: "pause", label: "Pausar" },
  { action: "resume", label: "Retomar" },
  { action: "skip", label: "Pular" },
  { action: "replay", label: "Replay" },
  { action: "clear", label: "Limpar" },
];

export function AlertLiveControls({ userId, token }: AlertLiveControlsProps) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState<AlertControlAction | null>(null);

  useEffect(() => {
    const socket = io("/alerts", {
      path: "/api/socket",
      auth: { userId, token },
    });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, token]);

  function send(action: AlertControlAction) {
    setBusy(action);
    socketRef.current?.emit("alert-control", { action });
    setTimeout(() => setBusy(null), 400);
  }

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Controle ao vivo</h3>
          <p className="text-[11px] text-zinc-500">
            Pausa, pula, replay ou limpa a fila do alerta no OBS
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            connected
              ? "bg-sky-400/12 text-sky-400"
              : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {connected ? "Conectado" : "Offline"}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ACTIONS.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            disabled={!connected || busy === action}
            onClick={() => send(action)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-sky-400/30 hover:text-white disabled:opacity-40"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
