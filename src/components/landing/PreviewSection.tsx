"use client";

import Link from "next/link";
import { tipPagePath } from "@/lib/brand";
import { useState } from "react";

export function PreviewSection() {
  const [fakeName, setFakeName] = useState("Maria");
  const [fakeAmount, setFakeAmount] = useState("25");
  const [alertActive, setAlertActive] = useState(false);
  const [alertKey, setAlertKey] = useState(0);

  function triggerAlert() {
    setAlertActive(false);
    setAlertKey((k) => k + 1);
    requestAnimationFrame(() => setAlertActive(true));
    setTimeout(() => setAlertActive(false), 5000);
  }

  const displayAmount = parseFloat(fakeAmount.replace(",", ".")) || 0;

  return (
    <section id="exemplos" className="border-t border-cyan-500/10 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
          Veja como sua página vai aparecer
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">
          Página do fã + alerta na live, lado a lado.
        </p>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-2">
          {/* Mockup página */}
          <div className="web3-card rounded-2xl p-4 shadow-xl">
            <div className="mb-3 flex items-center gap-2 border-b border-cyan-500/10 pb-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-zinc-500">pix.tips/seu-nome</span>
            </div>
            <div className="rounded-xl bg-gradient-to-b from-cyan-900/25 to-zinc-950 p-6 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=preview"
                alt=""
                className="mx-auto h-20 w-20 rounded-full"
              />
              <p className="mt-3 font-bold text-white">Seu Nome</p>
              <p className="text-sm text-zinc-400">Obrigado pelo apoio!</p>
              <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-3/5 rounded-full bg-cyan-500" />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((v) => (
                  <div
                    key={v}
                    className="rounded-lg bg-zinc-800 py-2 text-sm font-medium text-zinc-300"
                  >
                    R${v}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/10 py-6 text-sm text-emerald-400">
                QR Code Pix
              </div>
            </div>
            <Link
              href={tipPagePath("demo")}
              className="mt-4 block text-center text-sm text-cyan-400 hover:text-cyan-300"
            >
              Abrir demo real →
            </Link>
          </div>

          {/* Mockup OBS + simulador */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-black aspect-video">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-zinc-600">Sua transmissão ao vivo</p>
              </div>

              {alertActive && (
                <div
                  key={alertKey}
                  className="absolute inset-x-4 bottom-4 animate-slide-up-preview rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-900/95 to-violet-600/95 px-6 py-4 text-center shadow-2xl shadow-cyan-500/20"
                >
                  <p className="text-lg font-black text-white">
                    {fakeName || "Apoiador"} doou R${" "}
                    {displayAmount.toFixed(2).replace(".", ",")}!
                  </p>
                  <p className="mt-1 text-sm text-cyan-200">
                    Obrigado pelo apoio na live!
                  </p>
                </div>
              )}

              <div className="absolute left-3 top-3 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                AO VIVO
              </div>
            </div>

            <div className="web3-card mt-6 rounded-xl p-5">
              <p className="mb-4 text-sm font-medium text-zinc-300">
                Testar alerta ao vivo
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={fakeName}
                  onChange={(e) => setFakeName(e.target.value)}
                  placeholder="Nome do doador"
                  className="web3-glass rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  value={fakeAmount}
                  onChange={(e) => setFakeAmount(e.target.value)}
                  placeholder="Valor (R$)"
                  className="web3-glass rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={triggerAlert}
                className="web3-btn-primary mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
              >
                Disparar alerta simulado
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
