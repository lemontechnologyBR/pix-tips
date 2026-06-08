"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent-preferences";

interface CookiePreferences {
  essential: true;
  analytics: boolean;
  functional: boolean;
  timestamp: string;
}

function readPreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

function savePreferences(prefs: CookiePreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);

  useEffect(() => {
    if (!readPreferences()) setVisible(true);
  }, []);

  function acceptAll() {
    savePreferences({
      essential: true,
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString(),
    });
    setVisible(false);
  }

  function acceptEssential() {
    savePreferences({
      essential: true,
      analytics: false,
      functional: false,
      timestamp: new Date().toISOString(),
    });
    setVisible(false);
  }

  function saveCustom() {
    savePreferences({
      essential: true,
      analytics,
      functional,
      timestamp: new Date().toISOString(),
    });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="web3-glass-strong fixed inset-x-0 bottom-0 z-50 border-t border-cyan-500/20 p-4 sm:bottom-4 sm:inset-x-4 sm:rounded-xl sm:border">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">
            Usamos cookies para melhorar sua experiência. Veja nossa{" "}
            <Link href="/privacidade" className="text-cyan-400 hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-lg border border-zinc-600/60 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-400 hover:text-white"
            >
              {expanded ? "Fechar ▲" : "Gerenciar preferências"}
            </button>
            <button
              type="button"
              onClick={acceptEssential}
              className="rounded-lg border border-zinc-600/60 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-400 hover:text-white"
            >
              Somente essenciais
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="web3-btn-primary rounded-lg px-5 py-2 text-sm font-semibold text-white"
            >
              Aceitar todos
            </button>
          </div>
        </div>

        {expanded && (
          <div className="space-y-3 rounded-xl border border-zinc-700/60 bg-zinc-900/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Cookies essenciais</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Necessários para o funcionamento do site. Não podem ser desativados.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                Sempre ativo
              </span>
            </div>

            <div className="border-t border-zinc-800" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Cookies analíticos</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Nos ajudam a entender como o site é usado para melhorar a experiência.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                  analytics ? "border-cyan-500 bg-cyan-500" : "border-zinc-600 bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    analytics ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-zinc-800" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Cookies funcionais</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Permitem recursos como preferências salvas e personalização.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={functional}
                onClick={() => setFunctional((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                  functional ? "border-cyan-500 bg-cyan-500" : "border-zinc-600 bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    functional ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-zinc-800 pt-3">
              <button
                type="button"
                onClick={saveCustom}
                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
              >
                Salvar preferências
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CookieManageButton() {
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={reset}
      className="text-sm text-zinc-500 transition-colors hover:text-cyan-400"
    >
      Gerenciar cookies
    </button>
  );
}
