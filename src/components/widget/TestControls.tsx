"use client";

import { useState } from "react";
import { TEMPLATE_CATALOG } from "@/lib/alert-catalog";
import type { AlertTemplateId, DonationPayload } from "@/types";

interface TestControlsProps {
  userId: string;
  token: string;
  defaultTemplate?: AlertTemplateId;
  backgroundMedia?: DonationPayload["backgroundMedia"];
}

export function TestControls({
  defaultTemplate = "slide-up",
  backgroundMedia,
}: TestControlsProps) {
  const [name, setName] = useState("Maria");
  const [amount, setAmount] = useState("25");
  const [message, setMessage] = useState("Teste de alerta!");
  const [templateId, setTemplateId] = useState<AlertTemplateId>(defaultTemplate);
  const [soundId, setSoundId] = useState("ncs-correct");

  function dispatchTest() {
    const payload: DonationPayload = {
      name: name || "Apoiador",
      amount: parseFloat(amount.replace(",", ".")) || 10,
      message,
      templateId,
      soundId,
      soundUrl: null,
      backgroundMedia,
    };
    window.dispatchEvent(new CustomEvent("widget-test-alert", { detail: payload }));
  }

  async function dispatchLive() {
    await fetch("/api/user/alert-settings/test", { method: "POST" });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="font-semibold text-white">Controles de teste</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensagem"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white sm:col-span-2"
        />
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value as AlertTemplateId)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white sm:col-span-2"
        >
          {TEMPLATE_CATALOG.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={soundId}
          onChange={(e) => setSoundId(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white sm:col-span-2"
        >
          <option value="ding">Ding</option>
          <option value="sparkle">Sparkle</option>
          <option value="coin-collect">Moeda</option>
          <option value="achievement">Achievement</option>
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={dispatchTest}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Testar preview local
        </button>
        <button
          type="button"
          onClick={dispatchLive}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
        >
          Disparar no widget OBS
        </button>
      </div>
    </div>
  );
}
