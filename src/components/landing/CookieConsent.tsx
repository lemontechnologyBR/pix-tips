"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cookie-consent";

let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners.push(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
    window.removeEventListener("storage", callback);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot() {
  return true;
}

export function CookieConsent() {
  const accepted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "true");
    notifyListeners();
  }

  if (accepted) return null;

  return (
    <div className="web3-glass-strong fixed inset-x-0 bottom-0 z-50 border-t border-cyan-500/20 p-4 sm:bottom-4 sm:inset-x-4 sm:rounded-xl sm:border">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-center text-sm text-zinc-400 sm:text-left">
          Usamos cookies para melhorar sua experiência. Ao continuar, você concorda
          com nossa{" "}
          <a href="/privacidade" className="text-cyan-400 hover:underline">
            Política de Privacidade
          </a>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="web3-btn-primary shrink-0 rounded-lg px-5 py-2 text-sm font-semibold text-white"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
