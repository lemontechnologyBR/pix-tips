"use client";

import { useRef, useState } from "react";
import {
  BACKGROUND_GRADIENT_PRESETS,
  BACKGROUND_STYLE_OPTIONS,
  hasCustomBackground,
  TIP_PAGE_FONT_OPTIONS,
} from "@/lib/tip-page-background";
import { getLayoutPreset } from "@/lib/tip-page-layout-presets";
import type { TipPageBackgroundStyle, TipPageSettings } from "@/types";

interface TipPageAppearanceSettingsProps {
  settings: TipPageSettings;
  themeColor: string;
  onChange: (patch: Partial<TipPageSettings>) => void;
  onThemeColorChange: (color: string) => void;
}

export function TipPageAppearanceSettings({
  settings,
  themeColor,
  onChange,
  onThemeColorChange,
}: TipPageAppearanceSettingsProps) {
  const layoutId = settings.layoutId ?? "default";
  const layout = getLayoutPreset(layoutId);
  const isThemedLayout = layoutId !== "default" && layoutId !== "banner";
  const overridingTheme = isThemedLayout && hasCustomBackground(settings);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleBackgroundUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/user/tip-page-background", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Erro ao enviar");
        return;
      }
      onChange({
        backgroundStyle: "image",
        backgroundImageUrl: data.url,
      });
    } finally {
      setUploading(false);
    }
  }

  function applyGradientPreset(from: string, to: string) {
    onChange({
      backgroundStyle: "gradient",
      backgroundGradientFrom: from,
      backgroundGradientTo: to,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Cor primária
        </p>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="color"
            value={themeColor}
            onChange={(e) => onThemeColorChange(e.target.value)}
            className="h-11 w-14 cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950"
          />
          <span className="font-mono text-sm text-zinc-400">{themeColor}</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Aplicada como destaque em todos os layouts (botões, barra de meta e avatar).
        </p>
      </div>

      {isThemedLayout && (
        <div
          className={`rounded-xl border px-4 py-3 ${
            overridingTheme
              ? "border-cyan-500/25 bg-cyan-500/5"
              : "border-zinc-800 bg-zinc-950/40"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              overridingTheme ? "text-cyan-200" : "text-zinc-300"
            }`}
          >
            {overridingTheme
              ? `Fundo personalizado ativo — sobrepondo o tema do layout “${layout.name}”`
              : `O layout “${layout.name}” tem um fundo próprio`}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {overridingTheme
              ? "As configurações abaixo estão substituindo o fundo padrão deste layout. Restaure os valores neutros (estilo Tema + cor #09090b + modo escuro) para voltar ao tema original."
              : "Por padrão este layout usa seu próprio fundo temático. Ajuste qualquer opção abaixo para personalizá-lo — o restante do estilo (cards, formas e detalhes) é mantido."}
          </p>
        </div>
      )}

      <>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Estilo do fundo
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {BACKGROUND_STYLE_OPTIONS.map((opt) => {
            const active = settings.backgroundStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ backgroundStyle: opt.id as TipPageBackgroundStyle })}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                    : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-600"
                }`}
              >
                <p className={`text-sm font-medium ${active ? "text-cyan-200" : "text-zinc-300"}`}>
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {(settings.backgroundStyle === "solid" ||
        settings.backgroundStyle === "theme" ||
        settings.backgroundStyle === "gradient" ||
        settings.backgroundStyle === "image") && (
        <div>
          <label className="text-sm text-zinc-400">Cor base do fundo</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="h-11 w-14 cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950"
            />
            <input
              type="text"
              value={settings.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="w-32 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-white"
            />
          </div>
        </div>
      )}

      {settings.backgroundStyle === "gradient" && (
        <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
          <p className="text-sm font-medium text-zinc-300">Presets de gradiente</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {BACKGROUND_GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                onClick={() => applyGradientPreset(preset.from, preset.to)}
                className="group flex flex-col items-center gap-1.5"
              >
                <span
                  className="h-10 w-full rounded-lg border border-zinc-700/80 transition group-hover:ring-2 group-hover:ring-cyan-500/40"
                  style={{
                    background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                  }}
                />
                <span className="text-[10px] text-zinc-500">{preset.label}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-zinc-400">Cor inicial</span>
              <input
                type="color"
                value={settings.backgroundGradientFrom}
                onChange={(e) =>
                  onChange({ backgroundGradientFrom: e.target.value })
                }
                className="mt-1.5 h-10 w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-400">Cor final</span>
              <input
                type="color"
                value={settings.backgroundGradientTo}
                onChange={(e) => onChange({ backgroundGradientTo: e.target.value })}
                className="mt-1.5 h-10 w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950"
              />
            </label>
          </div>
        </div>
      )}

      {settings.backgroundStyle === "image" && (
        <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
          <label className="block text-sm">
            <span className="text-zinc-400">URL da imagem</span>
            <input
              type="url"
              value={settings.backgroundImageUrl ?? ""}
              onChange={(e) =>
                onChange({
                  backgroundImageUrl: e.target.value.trim() || null,
                })
              }
              placeholder="https://..."
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white"
            />
          </label>

          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                void handleBackgroundUpload(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-zinc-700 py-4 text-sm text-zinc-400 transition hover:border-cyan-500/40 hover:text-cyan-300 disabled:opacity-50"
            >
              {uploading ? "Enviando…" : "Enviar imagem do computador"}
            </button>
            {uploadError && (
              <p className="mt-2 text-xs text-red-400">{uploadError}</p>
            )}
          </div>

          {settings.backgroundImageUrl && (
            <div
              className="h-24 rounded-lg border border-zinc-800 bg-cover bg-center"
              style={{ backgroundImage: `url("${settings.backgroundImageUrl}")` }}
            />
          )}

          <label className="block text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Escurecer imagem</span>
              <span>{settings.backgroundImageOverlay}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              value={settings.backgroundImageOverlay}
              onChange={(e) =>
                onChange({ backgroundImageOverlay: Number(e.target.value) })
              }
              className="mt-2 w-full accent-cyan-500"
            />
          </label>
        </div>
      )}
      </>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-zinc-400">Fonte da página</span>
          <select
            value={settings.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white"
          >
            {TIP_PAGE_FONT_OPTIONS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-zinc-400">Mensagem de agradecimento</span>
          <input
            type="text"
            value={settings.thankYouMessage}
            onChange={(e) => onChange({ thankYouMessage: e.target.value })}
            maxLength={120}
            className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white"
          />
        </label>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
          <input
            type="checkbox"
            checked={settings.darkMode !== false}
            onChange={(e) => onChange({ darkMode: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-zinc-600 accent-cyan-500"
          />
          <span>
            <span className="block text-sm font-medium text-zinc-200">
              Modo escuro
            </span>
            <span className="mt-0.5 block text-xs text-zinc-500">
              Desative para exibir a página com fundo claro e texto escuro
            </span>
          </span>
        </label>
    </div>
  );
}
