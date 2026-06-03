"use client";

import { useState } from "react";
import type { GlobalAdminSettings } from "@/lib/repositories/admin-settings-repository";

interface AdminSettingsFormProps {
  initialSettings: GlobalAdminSettings;
}

export function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionRate: settings.commissionRate,
          proPrice: settings.proPrice,
          uploadLimitMb: settings.uploadLimitMb,
        }),
      });
      if (!res.ok) {
        setMessage("Erro ao salvar configurações.");
        return;
      }
      const data = (await res.json()) as GlobalAdminSettings;
      setSettings(data);
      setMessage("Configurações salvas com sucesso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <div>
        <label htmlFor="commissionRate" className="block text-sm font-medium">
          Taxa de comissão (%)
        </label>
        <p className="text-xs text-zinc-500">
          Percentual cobrado sobre cada doação confirmada.
        </p>
        <input
          id="commissionRate"
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={settings.commissionRate}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              commissionRate: parseFloat(e.target.value) || 0,
            }))
          }
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="proPrice" className="block text-sm font-medium">
          Preço do plano Pro (R$)
        </label>
        <p className="text-xs text-zinc-500">Valor mensal da assinatura Pro.</p>
        <input
          id="proPrice"
          type="number"
          min={0}
          step={0.01}
          value={settings.proPrice}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              proPrice: parseFloat(e.target.value) || 0,
            }))
          }
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="uploadLimitMb" className="block text-sm font-medium">
          Limite de upload (MB)
        </label>
        <p className="text-xs text-zinc-500">
          Tamanho máximo por arquivo de mídia nos alertas.
        </p>
        <input
          id="uploadLimitMb"
          type="number"
          min={1}
          max={500}
          step={1}
          value={settings.uploadLimitMb}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              uploadLimitMb: parseInt(e.target.value, 10) || 1,
            }))
          }
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${message.includes("sucesso") ? "text-emerald-400" : "text-red-400"}`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
