"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SOUND_CATALOG,
  SOUND_CATEGORY_LABELS,
  DEFAULT_ALERT_SOUND_ID,
  getSoundById,
  resolveAlertSoundId,
  type SoundCatalogItem,
} from "@/lib/alert-catalog";
import type { CustomSoundRecord, SoundCategory } from "@/types";
import { playCatalogSound, playCustomSound } from "@/lib/sounds";
import { SoundUpload } from "./SoundUpload";

export interface SoundSelection {
  soundId: string | null;
  soundUrl: string | null;
}

interface SoundLibraryProps {
  selectedId: string | null;
  selectedUrl: string | null;
  onSelect: (selection: SoundSelection) => void;
}

type MainTab = "ncs" | "catalog" | "custom";

const CATALOG_FILTERS: Array<{ id: SoundCategory | "all"; label: string }> = [
  { id: "all", label: "Todas as categorias" },
  { id: "classic", label: "Clássicos" },
  { id: "gaming", label: "Gaming" },
  { id: "funny", label: "Engraçados" },
  { id: "musical", label: "Musicais" },
  { id: "nature", label: "Natureza" },
  { id: "tech", label: "Tecnológicos" },
  { id: "voice", label: "Vozes" },
];

export function SoundLibrary({
  selectedId,
  selectedUrl,
  onSelect,
}: SoundLibraryProps) {
  const [tab, setTab] = useState<MainTab>("ncs");
  const [search, setSearch] = useState("");
  const [catalogFilter, setCatalogFilter] = useState<SoundCategory | "all">("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [customSounds, setCustomSounds] = useState<CustomSoundRecord[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/custom-sounds")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items: CustomSoundRecord[] }) => {
        if (!cancelled) setCustomSounds(data.items);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const activeSoundId = selectedUrl
    ? null
    : resolveAlertSoundId(selectedId, selectedUrl);

  const selectedCatalog = activeSoundId ? getSoundById(activeSoundId) : null;
  const selectedCustom = selectedUrl
    ? customSounds.find((s) => s.url === selectedUrl)
    : null;

  const selectedLabel =
    selectedCustom?.name ??
    selectedCatalog?.name ??
    "Tom Positivo";

  const isDefaultSound =
    !selectedUrl && activeSoundId === DEFAULT_ALERT_SOUND_ID;

  const selectedMeta = selectedCustom
    ? "Seu upload"
    : selectedCatalog
      ? SOUND_CATEGORY_LABELS[selectedCatalog.category]
      : null;

  const catalogSounds = useMemo(() => {
    return SOUND_CATALOG.filter((s) => {
      if (tab === "ncs" && s.category !== "ncs") return false;
      if (tab === "catalog") {
        if (s.category === "ncs") return false;
        if (catalogFilter !== "all" && s.category !== catalogFilter) return false;
      }
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tab, catalogFilter, search]);

  const filteredCustom = useMemo(() => {
    if (!search) return customSounds;
    const q = search.toLowerCase();
    return customSounds.filter((s) => s.name.toLowerCase().includes(q));
  }, [customSounds, search]);

  async function previewCatalog(sound: SoundCatalogItem) {
    setPlayingId(sound.id);
    await playCatalogSound(sound.id);
    setTimeout(() => setPlayingId(null), Math.max(sound.duration * 1000, 400));
  }

  async function previewCustom(sound: CustomSoundRecord) {
    setPlayingId(sound.id);
    await playCustomSound(sound.url);
    setTimeout(() => setPlayingId(null), 1500);
  }

  async function previewSelected() {
    if (selectedUrl && selectedCustom) {
      await previewCustom(selectedCustom);
      return;
    }
    if (activeSoundId && selectedCatalog) {
      await previewCatalog(selectedCatalog);
    } else if (activeSoundId) {
      setPlayingId(activeSoundId);
      await playCatalogSound(activeSoundId);
      setTimeout(() => setPlayingId(null), 1000);
    }
  }

  async function removeCustom(sound: CustomSoundRecord) {
    setDeletingId(sound.id);
    try {
      const res = await fetch(`/api/user/custom-sounds/${sound.id}`, { method: "DELETE" });
      if (res.ok) {
        setCustomSounds((list) => list.filter((s) => s.id !== sound.id));
        if (selectedUrl === sound.url) {
          onSelect({ soundId: DEFAULT_ALERT_SOUND_ID, soundUrl: null });
        }
      }
    } finally {
      setDeletingId(null);
    }
  }

  const tabs: Array<{ id: MainTab; label: string }> = [
    { id: "ncs", label: "Sem copyright" },
    { id: "catalog", label: "Catálogo" },
    { id: "custom", label: "Meus sons" },
  ];

  return (
    <div className="space-y-3">
      {/* Som ativo */}
      <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5">
        <button
          type="button"
          onClick={() => void previewSelected()}
          disabled={!activeSoundId && !selectedUrl}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full web3-btn-primary text-sm text-white hover:brightness-110 disabled:opacity-40"
          aria-label="Ouvir som selecionado"
        >
          ▶
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-cyan-300/80">
            Som do alerta
          </p>
          <p className="truncate text-sm font-medium text-white">
            {selectedLabel}
            {isDefaultSound && (
              <span className="ml-1.5 text-[10px] font-normal text-cyan-300/90">
                · padrão
              </span>
            )}
          </p>
          {selectedMeta && <p className="text-xs text-zinc-400">{selectedMeta}</p>}
        </div>
      </div>

      {/* Abas principais */}
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-950 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setSearch("");
            }}
            className={`rounded-md px-2 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "custom" && (
        <input
          type="search"
          placeholder="Buscar som..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      )}

      {tab === "catalog" && (
        <select
          value={catalogFilter}
          onChange={(e) => setCatalogFilter(e.target.value as SoundCategory | "all")}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
        >
          {CATALOG_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      )}

      {tab === "custom" && (
        <div className="space-y-3">
          <SoundUpload
            currentCount={customSounds.length}
            onUploaded={(record) => {
              setCustomSounds((list) => [record, ...list]);
              onSelect({ soundId: null, soundUrl: record.url });
            }}
          />
          {filteredCustom.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-800 py-6 text-center text-xs text-zinc-500">
              Nenhum som enviado ainda. Use o campo acima para adicionar MP3 ou WAV.
            </p>
          ) : (
            <ul className="max-h-36 space-y-1 overflow-y-auto">
              {filteredCustom.map((sound) => (
                <SoundRow
                  key={sound.id}
                  name={sound.name}
                  meta={`${sound.fileType.toUpperCase()} · ${(sound.fileSize / 1024).toFixed(0)} KB`}
                  active={selectedUrl === sound.url}
                  playing={playingId === sound.id}
                  onPlay={() => void previewCustom(sound)}
                  onSelect={() => onSelect({ soundId: null, soundUrl: sound.url })}
                  onDelete={() => void removeCustom(sound)}
                  deleting={deletingId === sound.id}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {tab !== "custom" && (
        <>
          {catalogSounds.length === 0 ? (
            <p className="py-4 text-center text-xs text-zinc-500">Nenhum som encontrado.</p>
          ) : (
            <ul className="max-h-36 space-y-1 overflow-y-auto pr-0.5">
              {catalogSounds.map((sound) => {
                const active =
                  !selectedUrl && activeSoundId === sound.id;
                const isDefault = sound.id === DEFAULT_ALERT_SOUND_ID;
                return (
                  <SoundRow
                    key={sound.id}
                    name={sound.name}
                    meta={`${Math.round(sound.duration)}s${isDefault ? " · padrão" : ""}`}
                    active={active}
                    locked={false}
                    playing={playingId === sound.id}
                    onPlay={() => void previewCatalog(sound)}
                    onSelect={() => onSelect({ soundId: sound.id, soundUrl: null })}
                  />
                );
              })}
            </ul>
          )}
          <p className="text-[11px] text-zinc-600">
            Clique no som para selecionar · ▶ para ouvir antes
          </p>
        </>
      )}
    </div>
  );
}

function SoundRow({
  name,
  meta,
  active,
  locked,
  playing,
  onPlay,
  onSelect,
  onDelete,
  deleting,
}: {
  name: string;
  meta: string;
  active: boolean;
  locked?: boolean;
  playing: boolean;
  onPlay: () => void;
  onSelect: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-2 rounded-lg border px-2 py-2 transition ${
        active
          ? "border-cyan-500 bg-cyan-500/15"
          : "border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700"
      } ${locked ? "opacity-45" : ""}`}
    >
      <button
        type="button"
        disabled={locked}
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] hover:bg-zinc-700 disabled:cursor-not-allowed"
        aria-label={`Ouvir ${name}`}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <button
        type="button"
        disabled={locked}
        onClick={onSelect}
        className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
      >
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-zinc-500">{meta}</p>
      </button>
      {active && (
        <span className="shrink-0 text-cyan-400" aria-hidden>
          ✓
        </span>
      )}
      {locked && (
        <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
          Pro
        </span>
      )}
      {onDelete && (
        <button
          type="button"
          disabled={deleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="shrink-0 rounded p-1 text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50"
          aria-label={`Remover ${name}`}
        >
          ✕
        </button>
      )}
    </li>
  );
}
