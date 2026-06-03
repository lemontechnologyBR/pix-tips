"use client";

import { usePathname } from "next/navigation";
import { usePwaInstall } from "@/components/shared/PwaInstallProvider";

export function PwaInstallTopBar() {
  const pathname = usePathname();
  const { canShowBanner, canInstall, isIos, isChrome, isMobile, install, dismiss, installed } =
    usePwaInstall();

  if (pathname.startsWith("/widget") || installed || !canShowBanner) {
    return null;
  }

  async function handleInstall() {
    if (canInstall) {
      await install();
    }
  }

  const buttonLabel = canInstall
    ? "Instalar app"
    : isMobile
      ? "Abrir no app"
      : "Como instalar";

  return (
    <div className="sticky top-0 z-[60] border-b border-cyan-500/20 web3-glass-strong">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/app-icon.svg" alt="" className="h-7 w-7 shrink-0 rounded-lg" />
          <span className="truncate text-sm text-zinc-300">
            {isMobile ? "pix.tips" : "Instale o pix.tips no seu dispositivo"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className={
              isMobile && !canInstall
                ? "rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm active:scale-[0.98]"
                : "web3-btn-primary rounded-full px-4 py-1.5 text-sm font-semibold text-white"
            }
          >
            {buttonLabel}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar nesta sessão"
            className="rounded-full p-1.5 text-zinc-500 hover:text-zinc-300"
          >
            ✕
          </button>
        </div>
      </div>
      {!canInstall && isIos && (
        <p className="border-t border-cyan-500/10 px-3 py-2 text-center text-xs text-zinc-400">
          Safari → Compartilhar → Adicionar à Tela de Início
        </p>
      )}
      {!canInstall && isChrome && !isIos && (
        <p className="border-t border-cyan-500/10 px-3 py-2 text-center text-xs text-zinc-400">
          Chrome → ícone ⊕ na barra de endereço ou Menu → Instalar pix.tips
        </p>
      )}
    </div>
  );
}

export function PwaInstallButton({ className = "" }: { className?: string }) {
  const { installed, canInstall, isIos, isChrome, install } = usePwaInstall();

  if (installed) {
    return (
      <p className={`text-sm text-emerald-400 ${className}`}>
        App instalado neste dispositivo
      </p>
    );
  }

  if (canInstall) {
    return (
      <button
        type="button"
        onClick={() => install()}
        className={`web3-btn-primary rounded-lg px-4 py-2 text-sm font-semibold text-white ${className}`}
      >
        Instalar app
      </button>
    );
  }

  if (isIos) {
    return (
      <p className={`text-xs leading-relaxed text-zinc-400 ${className}`}>
        No Safari: Compartilhar → Adicionar à Tela de Início
      </p>
    );
  }

  if (isChrome) {
    return (
      <p className={`text-xs text-zinc-500 ${className}`}>
        Use a barra no topo ou o ícone ⊕ no Chrome para instalar.
      </p>
    );
  }

  return (
    <p className={`text-xs text-zinc-500 ${className}`}>
      Abra no Chrome ou Edge para instalar o app.
    </p>
  );
}
