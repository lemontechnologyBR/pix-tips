"use client";

import { useState } from "react";
import { API_DOCS } from "@/lib/api-docs-data";

export function ApiDocsContent() {
  const [activeSection, setActiveSection] = useState("auth");

  const nav = [
    { id: "auth", label: "Autenticação" },
    { id: "webhooks", label: "Webhooks" },
    { id: "endpoints", label: "Endpoints" },
  ];

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
      <nav className="lg:w-48 lg:shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Nesta página
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {nav.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`text-left transition ${
                  activeSection === item.id
                    ? "text-cyan-400"
                    : "text-zinc-400 hover:text-cyan-300"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
          API em beta — comportamento pode mudar. Versão {API_DOCS.version}.
        </p>
      </nav>

      <div className="min-w-0 flex-1 space-y-14">
        <section id="auth" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold text-white">{API_DOCS.authentication.title}</h2>
          <p className="mt-3 leading-relaxed text-zinc-400">
            {API_DOCS.authentication.description}
          </p>
          <div className="web3-card mt-6 overflow-hidden rounded-xl">
            <div className="border-b border-zinc-800 px-4 py-2 text-xs text-zinc-500">
              Header obrigatório
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm text-cyan-300">
              {API_DOCS.authentication.headerName}: {API_DOCS.authentication.headerExample}
            </pre>
          </div>
          <p className="mt-4 text-sm text-zinc-500">{API_DOCS.authentication.note}</p>
          <p className="mt-2 text-sm text-zinc-500">
            Base URL:{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-cyan-300">
              {API_DOCS.baseUrl}
            </code>
          </p>
        </section>

        <section id="webhooks" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold text-white">Webhooks</h2>
          <p className="mt-3 text-zinc-400">
            Configure um endpoint HTTPS para receber eventos assinados com HMAC-SHA256 no header{" "}
            <code className="text-cyan-300">X-Tip-Page-Signature</code>.
          </p>
          <div className="mt-8 space-y-8">
            {API_DOCS.webhooks.map((wh) => (
              <div
                key={wh.name}
                className="web3-card rounded-xl p-5"
              >
                <code className="text-sm font-semibold text-emerald-400">{wh.name}</code>
                <p className="mt-2 text-sm text-zinc-400">{wh.description}</p>
                <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-400">
                  {wh.payloadExample}
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section id="endpoints" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold text-white">Endpoints</h2>
          <p className="mt-3 text-zinc-400">
            Referência dos principais recursos REST. Substitua{" "}
            <code className="text-cyan-300">tp_live_SUA_CHAVE</code> pela chave do dashboard.
          </p>
          <div className="mt-8 space-y-6">
            {API_DOCS.endpoints.map((ep) => (
              <div
                key={`${ep.method}-${ep.path}`}
                className="web3-card overflow-hidden rounded-xl"
              >
                <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                      ep.method === "GET"
                        ? "bg-blue-500/20 text-blue-400"
                        : ep.method === "POST"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="font-mono text-sm text-white">
                    {API_DOCS.baseUrl}
                    {ep.path}
                  </code>
                </div>
                <p className="px-4 py-3 text-sm text-zinc-400">{ep.description}</p>
                <pre className="overflow-x-auto border-t border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-400">
                  {ep.curl}
                </pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
