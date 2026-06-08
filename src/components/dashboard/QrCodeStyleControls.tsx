"use client";

import { useState } from "react";
import { GOAL_OVERLAY_POSITIONS } from "@/lib/goal-overlay-position";
import { QR_WIDGET_ANIMATIONS } from "@/lib/qr-widget-animation";
import type {
  GoalOverlayPosition,
  QrCodeSettings,
  QrCodeTextStyle,
  QrTextAlignment,
} from "@/types";

const CARD_COLORS = ["#ffffff", "#1e293b", "#0f172a", "#7c3aed", "#059669"];

interface QrCodeStyleControlsProps {
  title: string;
  style: QrCodeTextStyle;
  onChange: (patch: Partial<QrCodeTextStyle>) => void;
  showDescriptionField?: boolean;
  description?: string;
  onDescriptionChange?: (value: string) => void;
}

function AlignmentButtons({
  value,
  onChange,
}: {
  value: QrTextAlignment;
  onChange: (v: QrTextAlignment) => void;
}) {
  const opts: { id: QrTextAlignment; icon: string }[] = [
    { id: "left", icon: "⫷" },
    { id: "center", icon: "☰" },
    { id: "right", icon: "⫸" },
  ];
  return (
    <div className="flex gap-1">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          title={o.id}
          onClick={() => onChange(o.id)}
          className={`h-8 w-8 rounded border text-sm transition ${
            value === o.id
              ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
              : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

function MarginSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-[11px]">
      <span className="text-zinc-500">{label}</span>
      <input
        type="range"
        min={0}
        max={40}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 w-full"
      />
    </label>
  );
}

export function QrCodeStyleControls({
  title,
  style,
  onChange,
  showDescriptionField,
  description,
  onDescriptionChange,
}: QrCodeStyleControlsProps) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white"
      >
        {title}
        <span className="text-zinc-500">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-zinc-800 px-4 pb-4 pt-3">
          {showDescriptionField && onDescriptionChange && (
            <label className="block text-sm">
              <span className="text-zinc-400">Descrição</span>
              <input
                value={description ?? ""}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              />
            </label>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="mb-1.5 text-[11px] text-zinc-500">Alinhamento</p>
              <AlignmentButtons
                value={style.alignment}
                onChange={(alignment) => onChange({ alignment })}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] text-zinc-500">Cor do texto</p>
              <div className="flex items-center gap-2">
                {CARD_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange({ color: c })}
                    className={`h-7 w-7 rounded-full border-2 ${
                      style.color === c ? "border-cyan-400" : "border-zinc-600"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={style.color}
                  onChange={(e) => onChange({ color: e.target.value })}
                  className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
                />
              </div>
            </div>
          </div>

          <label className="block text-sm">
            <span className="text-zinc-400">Tamanho da fonte ({style.fontSize}px)</span>
            <input
              type="range"
              min={10}
              max={24}
              value={style.fontSize}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              className="mt-1.5 w-full"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MarginSlider
              label="Margem top"
              value={style.marginTop}
              onChange={(marginTop) => onChange({ marginTop })}
            />
            <MarginSlider
              label="Margem bottom"
              value={style.marginBottom}
              onChange={(marginBottom) => onChange({ marginBottom })}
            />
            <MarginSlider
              label="Margem left"
              value={style.marginLeft}
              onChange={(marginLeft) => onChange({ marginLeft })}
            />
            <MarginSlider
              label="Margem right"
              value={style.marginRight}
              onChange={(marginRight) => onChange({ marginRight })}
            />
          </div>
        </div>
      )}
    </section>
  );
}

const FONT_FAMILIES: { value: string; label: string }[] = [
  { value: "system-ui, sans-serif", label: "Sistema" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Impact, sans-serif", label: "Impact" },
];

export function QrCodeAppearanceControls({
  settings,
  onChange,
}: {
  settings: Pick<
    QrCodeSettings,
    | "cardBackground"
    | "cardBorderRadius"
    | "cardBorderColor"
    | "cardShadow"
    | "transparentBg"
    | "fontFamily"
    | "qrForeground"
    | "qrBackground"
    | "qrSize"
    | "showAvatarInQr"
  >;
  onChange: (patch: Partial<QrCodeSettings>) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white"
      >
        Estilo do QR Code
        <span className="text-zinc-500">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-zinc-800 px-4 pb-4 pt-3">

          {/* Família da fonte */}
          <label className="block text-sm">
            <span className="text-zinc-400">Família da fonte</span>
            <select
              value={settings.fontFamily}
              onChange={(e) => onChange({ fontFamily: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          {/* Fundo do card + transparente */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] text-zinc-500">Fundo do card</p>
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-400">
                <input
                  type="checkbox"
                  checked={settings.transparentBg}
                  onChange={(e) => onChange({ transparentBg: e.target.checked })}
                  className="h-3.5 w-3.5 rounded accent-cyan-500"
                />
                Transparente
              </label>
            </div>
            <div className={`flex flex-wrap items-center gap-2 transition ${settings.transparentBg ? "pointer-events-none opacity-40" : ""}`}>
              {CARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ cardBackground: c })}
                  className={`h-8 w-8 rounded-lg border-2 ${
                    settings.cardBackground === c ? "border-cyan-400" : "border-zinc-600"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={settings.cardBackground}
                onChange={(e) => onChange({ cardBackground: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-zinc-700"
              />
            </div>
          </div>

          {/* Arredondamento + sombra */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-zinc-400">Arredondamento ({settings.cardBorderRadius}px)</span>
              <input
                type="range"
                min={0}
                max={32}
                value={settings.cardBorderRadius}
                onChange={(e) => onChange({ cardBorderRadius: Number(e.target.value) })}
                className="mt-1.5 w-full"
              />
            </label>
            <div>
              <p className="mb-1.5 text-sm text-zinc-400">Cor da borda</p>
              <input
                type="color"
                value={settings.cardBorderColor === "transparent" ? "#000000" : settings.cardBorderColor}
                onChange={(e) => onChange({ cardBorderColor: e.target.value })}
                className="h-9 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
              />
            </div>
          </div>

          {/* Sombra toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={settings.cardShadow}
              onChange={(e) => onChange({ cardShadow: e.target.checked })}
              className="h-4 w-4 rounded accent-cyan-500"
            />
            Sombra no card
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-zinc-400">Cor do QR</span>
              <input
                type="color"
                value={settings.qrForeground}
                onChange={(e) => onChange({ qrForeground: e.target.value })}
                className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-400">Fundo do QR</span>
              <input
                type="color"
                value={settings.qrBackground}
                onChange={(e) => onChange({ qrBackground: e.target.value })}
                className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-zinc-400">Tamanho do QR ({settings.qrSize}px)</span>
            <input
              type="range"
              min={160}
              max={280}
              value={settings.qrSize}
              onChange={(e) => onChange({ qrSize: Number(e.target.value) })}
              className="mt-1.5 w-full"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={settings.showAvatarInQr}
              onChange={(e) => onChange({ showAvatarInQr: e.target.checked })}
              className="h-4 w-4 rounded accent-cyan-500"
            />
            Avatar no centro do QR
          </label>
          <p className="text-[11px] text-zinc-500">
            Exibe seu avatar no centro. Sem avatar cadastrado, usa a marca pix.tips.
          </p>
        </div>
      )}
    </section>
  );
}

const ANIMATION_SPEEDS: { value: "slow" | "normal" | "fast"; label: string }[] = [
  { value: "slow", label: "Lenta" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Rápida" },
];

export function QrCodeWidgetControls({
  settings,
  onChange,
}: {
  settings: Pick<QrCodeSettings, "animation" | "animationSpeed" | "widgetPosition">;
  onChange: (patch: Partial<QrCodeSettings>) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white"
      >
        Widget OBS
        <span className="text-zinc-500">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-zinc-800 px-4 pb-4 pt-3">
          <div>
            <p className="mb-2 text-[11px] text-zinc-500">Animação</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {QR_WIDGET_ANIMATIONS.map((anim) => (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => onChange({ animation: anim.id })}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    settings.animation === anim.id
                      ? "border-cyan-500 bg-cyan-500/15 text-cyan-100"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <span className="font-medium">{anim.name}</span>
                  <span className="mt-0.5 block text-[11px] text-zinc-500">
                    {anim.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {settings.animation !== "none" && (
            <div>
              <p className="mb-2 text-[11px] text-zinc-500">Velocidade da animação</p>
              <div className="flex gap-2">
                {ANIMATION_SPEEDS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => onChange({ animationSpeed: s.value })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      settings.animationSpeed === s.value
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-100"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] text-zinc-500">Posição na tela</p>
            <div className="grid grid-cols-3 gap-2 max-w-xs">
              {GOAL_OVERLAY_POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  title={pos.label}
                  onClick={() =>
                    onChange({ widgetPosition: pos.id as GoalOverlayPosition })
                  }
                  className={`rounded-lg border py-2 text-lg transition ${
                    settings.widgetPosition === pos.id
                      ? "border-cyan-500 bg-cyan-500/15 text-cyan-200"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                  }`}
                >
                  {pos.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
