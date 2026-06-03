"use client";

import { useEffect, useState } from "react";
import {
  isWidgetAudioUnlocked,
  preloadCatalogSound,
  unlockWidgetAudio,
} from "@/lib/sounds";

export function WidgetAudioUnlock() {
  const [needsUnlock, setNeedsUnlock] = useState(false);

  useEffect(() => {
    preloadCatalogSound();
    void unlockWidgetAudio().then((ok) => setNeedsUnlock(!ok));
  }, []);

  async function handleUnlock() {
    const ok = await unlockWidgetAudio();
    setNeedsUnlock(!ok);
  }

  if (!needsUnlock || isWidgetAudioUnlocked()) return null;

  return (
    <button
      type="button"
      onClick={() => void handleUnlock()}
      className="pointer-events-auto fixed bottom-4 left-1/2 z-[99999] -translate-x-1/2 rounded-full border border-violet-500/60 bg-zinc-950/95 px-4 py-2.5 text-xs font-semibold text-violet-100 shadow-xl shadow-black/40 backdrop-blur-sm transition hover:border-violet-400 hover:bg-violet-600/20"
    >
      Clique para ativar o som
    </button>
  );
}
