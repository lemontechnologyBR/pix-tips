"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="web3-glass fixed bottom-20 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-500/30 text-zinc-300 transition hover:border-cyan-500/50 hover:text-white sm:bottom-6 sm:left-6"
    >
      ↑
    </button>
  );
}
