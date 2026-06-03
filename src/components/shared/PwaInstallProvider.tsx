"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaInstallContextValue {
  installed: boolean;
  canInstall: boolean;
  isMobile: boolean;
  isIos: boolean;
  isChrome: boolean;
  canShowBanner: boolean;
  install: () => Promise<boolean>;
  dismiss: () => void;
}

declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function detectMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function detectMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
  const narrow = typeof window !== "undefined" && detectMobileViewport();
  return ua || narrow;
}

function detectIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function detectChrome(): boolean {
  if (typeof navigator === "undefined") return false;
  return /chrome|crios|chromium/i.test(navigator.userAgent) && !/edg/i.test(navigator.userAgent);
}

function registerServiceWorker() {
  // registrado em PwaBoot
}

function readDeferredPrompt(): BeforeInstallPromptEvent | null {
  return window.__pwaDeferredPrompt ?? null;
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(detectMobile());
    updateMobile();
    setIsIos(detectIos());
    setIsChrome(detectChrome());
    registerServiceWorker();

    if (isStandalone()) {
      setInstalled(true);
      setReady(true);
      return;
    }

    // Só esconde nesta aba — volta ao reabrir o Chrome
    if (sessionStorage.getItem("pwa-install-dismissed") === "1") {
      setDismissed(true);
    }

    const existing = readDeferredPrompt();
    if (existing) {
      setDeferredPrompt(existing);
    }

    function capturePrompt(e: Event) {
      // preventDefault mantém o botão "Instalar" nativo do Chrome na barra de endereço
      e.preventDefault();
      window.__pwaDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
    }

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("resize", updateMobile);
    setReady(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("resize", updateMobile);
    };
  }, []);

  const canInstall = Boolean(deferredPrompt) && !installed;

  // Banner sempre visível até instalar (Chrome, mobile, desktop)
  const canShowBanner = ready && !installed && !dismissed;

  const install = useCallback(async () => {
    const prompt = deferredPrompt ?? readDeferredPrompt();
    if (!prompt) return false;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setDeferredPrompt(null);
    window.__pwaDeferredPrompt = null;
    if (outcome === "accepted") {
      setInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    setDismissed(true);
  }, []);

  const value = useMemo(
    () => ({
      installed,
      canInstall,
      isMobile,
      isIos,
      isChrome,
      canShowBanner,
      install,
      dismiss,
    }),
    [installed, canInstall, isMobile, isIos, isChrome, canShowBanner, install, dismiss],
  );

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}

export function usePwaInstall(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }
  return ctx;
}
