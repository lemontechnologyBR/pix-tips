"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TipFanSessionProvider, useTipFanSession } from "./TipFanSessionContext";
import { TipPageNav } from "./TipPageNav";

function TipPageOAuthFeedbackInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { refresh } = useTipFanSession();
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  useEffect(() => {
    const error = searchParams.get("error");
    const connected = searchParams.get("connected");
    if (!error && !connected) return;

    if (connected) {
      setBanner({
        type: "ok",
        text: `${connected} conectado na sua conta de fã.`,
      });
      void refresh();
    } else if (error) {
      const friendly = error.includes("já está vinculada")
        ? "Esse Discord já está em outra conta do pix.tips. Desvincula lá em Integrações ou entra com Discord direto (sem Google antes)."
        : error;
      setBanner({ type: "err", text: friendly });
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete("error");
    next.delete("connected");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router, refresh]);

  if (!banner) return null;

  return (
    <div
      className={`px-4 py-2.5 text-center text-sm ${
        banner.type === "ok"
          ? "border-b border-sky-400/20 bg-sky-500/10 text-sky-100"
          : "border-b border-rose-400/20 bg-rose-500/10 text-rose-100"
      }`}
    >
      {banner.text}
      <button
        type="button"
        className="ml-3 underline opacity-80 hover:opacity-100"
        onClick={() => setBanner(null)}
      >
        Fechar
      </button>
    </div>
  );
}

export function TipPageShell({ children }: { children: ReactNode }) {
  return (
    <TipFanSessionProvider>
      <TipPageNav />
      <Suspense fallback={null}>
        <TipPageOAuthFeedbackInner />
      </Suspense>
      {children}
    </TipFanSessionProvider>
  );
}
