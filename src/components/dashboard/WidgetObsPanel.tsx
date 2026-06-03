"use client";

import Link from "next/link";
import { useState } from "react";

interface WidgetObsPanelProps {
  widgetUrl: string;
  title?: string;
  description?: string;
}

export function WidgetObsPanel({
  widgetUrl,
  title = "Widget OBS",
  description = "Adicione como fonte Navegador no OBS ou Streamlabs.",
}: WidgetObsPanelProps) {
  const [copied, setCopied] = useState(false);
  const widgetPath = widgetUrl.replace(/^https?:\/\/[^/]+/, "");

  async function copyWidget() {
    const full =
      typeof window !== "undefined" && !widgetUrl.startsWith("http")
        ? `${window.location.origin}${widgetUrl}`
        : widgetUrl;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/90">
        <p className="truncate px-3 py-2 font-mono text-[11px] text-zinc-500">{widgetPath}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:max-w-md">
        <button
          type="button"
          onClick={copyWidget}
          className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
            copied
              ? "border-emerald-500/50 bg-emerald-600/15 text-emerald-300"
              : "border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:border-zinc-600"
          }`}
        >
          {copied ? "Link copiado!" : "Copiar link OBS"}
        </button>
        <Link
          href={widgetPath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2.5 text-sm font-medium text-zinc-200 hover:border-zinc-500"
        >
          Abrir widget
        </Link>
      </div>
    </section>
  );
}

interface PositionPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function WidgetPositionPicker({
  value,
  onChange,
  label = "Posição na tela (OBS)",
}: PositionPickerProps) {
  const positions = [
    { id: "top-left", icon: "↖" },
    { id: "top-center", icon: "↑" },
    { id: "top-right", icon: "↗" },
    { id: "bottom-left", icon: "↙" },
    { id: "bottom-center", icon: "↓" },
    { id: "bottom-right", icon: "↘" },
  ] as const;

  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-2 grid max-w-[14rem] grid-cols-6 gap-1">
        {positions.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              title={p.id}
              onClick={() => onChange(p.id)}
              className={`rounded border py-1 text-xs transition ${
                active
                  ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
              }`}
            >
              {p.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
