"use client";

import { useState } from "react";

const RIGHTS = [
  "Confirmação e acesso aos meus dados",
  "Correção de dados incorretos",
  "Eliminação dos meus dados",
  "Portabilidade dos meus dados (exportar em JSON)",
  "Informação sobre compartilhamento de dados",
  "Revogação de consentimento",
  "Oposição ao tratamento de dados",
  "Revisão de decisão automatizada (ex: KYC recusado)",
] as const;

export function LgpdRequestForm() {
  const [tipo, setTipo] = useState("");
  const [detalhes, setDetalhes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Solicitação LGPD - ${tipo}`);
    const body = encodeURIComponent(detalhes);
    window.location.href = `mailto:privacidade@pix.tips?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="lgpd-tipo" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Tipo de solicitação
        </label>
        <select
          id="lgpd-tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <option value="" disabled>
            Selecione um direito
          </option>
          {RIGHTS.map((right) => (
            <option key={right} value={right}>
              {right}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="lgpd-detalhes"
          className="mb-1.5 block text-sm font-medium text-zinc-300"
        >
          Detalhes (opcional)
        </label>
        <textarea
          id="lgpd-detalhes"
          rows={4}
          value={detalhes}
          onChange={(e) => setDetalhes(e.target.value)}
          placeholder="Descreva sua solicitação com mais detalhes, se necessário..."
          className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="submit"
          className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
          disabled={!tipo}
        >
          Enviar solicitação
        </button>
        <p className="text-xs text-zinc-500">
          Respondemos em até{" "}
          <span className="font-medium text-zinc-400">15 dias úteis</span> conforme a LGPD.
        </p>
      </div>
    </form>
  );
}
