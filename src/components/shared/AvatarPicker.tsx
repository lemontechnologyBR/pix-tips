"use client";

import { useRef, useState } from "react";
import {
  AVATAR_PRESETS,
  avatarUrlFromPreset,
  avatarUrlFromSeed,
  findPresetByUrl,
} from "@/lib/avatar-presets";

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
  username?: string;
}

export function AvatarPicker({ value, onChange, username }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const displayUrl =
    value ||
    avatarUrlFromSeed(username || "tip");

  const selectedPresetId = findPresetByUrl(value)?.id;
  const isCustomUpload = Boolean(value && !selectedPresetId && !value.includes("dicebear.com"));

  async function handleUpload(file: File) {
    setError("");
    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
      setError("Use PNG, JPG ou WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Máximo 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/user/avatar", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Falha no upload.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <span className="text-sm text-zinc-400">Avatar</span>

      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-full border-2 border-violet-500/40 bg-zinc-800 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-500">
            {isCustomUpload
              ? "Foto enviada por você"
              : selectedPresetId
                ? "Avatar genérico"
                : "Avatar padrão do seu usuário"}
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="mt-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-violet-500 disabled:opacity-50"
          >
            {uploading ? "Enviando..." : "Enviar minha foto"}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-zinc-600">
        Ou escolha um avatar genérico ({AVATAR_PRESETS.length} opções):
      </p>
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
        {AVATAR_PRESETS.map((preset) => {
          const url = avatarUrlFromPreset(preset);
          const selected = value === url;
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.label}
              onClick={() => onChange(url)}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                selected
                  ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-zinc-950"
                  : "ring-1 ring-zinc-700 hover:ring-zinc-500"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={preset.label}
                className="h-9 w-9 rounded-full bg-zinc-800 object-cover"
              />
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
