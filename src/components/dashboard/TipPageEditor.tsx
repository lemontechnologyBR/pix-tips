"use client";

import Link from "next/link";
import { tipPagePath } from "@/lib/brand";
import { useCallback, useEffect, useRef, useState } from "react";
import { AvatarPicker } from "@/components/shared/AvatarPicker";
import { OverviewIcon } from "@/components/dashboard/OverviewIcon";
import { TipPageDonationSettings } from "./TipPageDonationSettings";
import { TipPageAppearanceSettings } from "./TipPageAppearanceSettings";
import { TipPageTtsSettings } from "./TipPageTtsSettings";
import { TipPageLayoutPicker } from "./TipPageLayoutPicker";
import { TipPageRenderer } from "@/components/tip/TipPageRenderer";
import { getLayoutPreset } from "@/lib/tip-page-layout-presets";
import type { Creator } from "@/types";

const PREVIEW_VIRTUAL_WIDTH = 1180;

/**
 * Prévia real e fiel: renderiza o MESMO componente da página pública
 * (TipPageRenderer) numa viewport virtual escalada. Reflete cor primária,
 * fundo, layout e todas as configurações exatamente como o apoiador verá.
 *
 * A altura virtual acompanha a altura real da janela para que os layouts
 * com `min-h-screen` preencham exatamente o quadro, sem sobra no rodapé.
 */
function LivePreview({ creator }: { creator: Creator }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.32);
  const [virtualHeight, setVirtualHeight] = useState(900);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setScale(el.clientWidth / PREVIEW_VIRTUAL_WIDTH);
      setVirtualHeight(window.innerHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
      style={{ height: virtualHeight * scale }}
    >
      <div
        className="pointer-events-none origin-top-left select-none"
        style={{
          width: PREVIEW_VIRTUAL_WIDTH,
          height: virtualHeight,
          transform: `scale(${scale})`,
        }}
      >
        <TipPageRenderer creator={creator} recentDonations={[]} />
      </div>
    </div>
  );
}

interface TipPageEditorProps {
  initialCreator: Creator;
}

type TabId = "identidade" | "layout" | "aparencia" | "doacao" | "interacao";

const TABS: { id: TabId; label: string; icon: "users" | "spark" | "link" | "check" }[] = [
  { id: "identidade", label: "Identidade", icon: "users" },
  { id: "layout", label: "Layout", icon: "spark" },
  { id: "aparencia", label: "Aparência", icon: "spark" },
  { id: "doacao", label: "Doação", icon: "link" },
  { id: "interacao", label: "Interação", icon: "check" },
];

function ToggleCard({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-zinc-600 accent-cyan-500"
      />
      <span>
        <span className="block text-sm font-medium text-zinc-200">{title}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{description}</span>
      </span>
    </label>
  );
}

export function TipPageEditor({ initialCreator }: TipPageEditorProps) {
  const [creator, setCreator] = useState(initialCreator);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<TabId>("identidade");

  const update = useCallback((patch: Partial<Creator>) => {
    setCreator((c) => ({ ...c, ...patch }));
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<Creator["tipPageSettings"]>) => {
      setCreator((c) => ({
        ...c,
        tipPageSettings: { ...c.tipPageSettings, ...patch },
      }));
    },
    [],
  );

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/tip-page-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creator),
      });
      if (res.ok) {
        setToast("Alterações salvas!");
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    const full = `${window.location.origin}${tipPagePath(creator.username)}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const s = creator.tipPageSettings;

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <OverviewIcon name="link" className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Minha página</h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-400">
              Personalize a tip page que seus apoiadores veem ao doar.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:border-cyan-500/40"
          >
            <OverviewIcon name="link" className="h-4 w-4" />
            {copied ? "Copiado!" : "Copiar link"}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-xl web3-btn-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Coluna de edição */}
        <div className="min-w-0 space-y-5">
          {/* Abas */}
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-1.5">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/40"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <OverviewIcon name={t.icon} className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 sm:p-6">
            {tab === "identidade" && (
              <div className="space-y-4">
                <AvatarPicker
                  value={creator.avatar}
                  onChange={(url) => update({ avatar: url })}
                  username={creator.username}
                />
                <label className="block text-sm">
                  <span className="text-zinc-400">Nome de exibição</span>
                  <input
                    value={creator.displayName}
                    onChange={(e) => update({ displayName: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-white"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-400">Bio</span>
                  <textarea
                    value={creator.bio}
                    maxLength={300}
                    rows={3}
                    onChange={(e) => update({ bio: e.target.value })}
                    placeholder="Conte um pouco sobre você ou sua live..."
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2.5 text-white"
                  />
                  <span className="mt-1 block text-right text-[11px] text-zinc-600">
                    {creator.bio.length}/300
                  </span>
                </label>
              </div>
            )}

            {tab === "layout" && (
              <div className="space-y-3">
                <div>
                  <h2 className="font-semibold text-white">Escolha um layout</h2>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    A estrutura da página muda conforme o layout. Veja a prévia ao lado.
                  </p>
                </div>
                <TipPageLayoutPicker
                  value={s.layoutId ?? "default"}
                  onChange={(layoutId) => {
                    const preset = getLayoutPreset(layoutId);
                    setCreator((c) => ({
                      ...c,
                      themeColor: preset.preview.accent || c.themeColor,
                      tipPageSettings: { ...c.tipPageSettings, layoutId },
                    }));
                  }}
                />
              </div>
            )}

            {tab === "aparencia" && (
              <TipPageAppearanceSettings
                settings={s}
                themeColor={creator.themeColor}
                onChange={updateSettings}
                onThemeColorChange={(themeColor) => update({ themeColor })}
              />
            )}

            {tab === "doacao" && (
              <TipPageDonationSettings
                goal={creator.goal}
                raised={creator.raised}
                goalTitle={s.goalTitle}
                presetAmounts={s.presetAmounts}
                minDonation={s.minDonation}
                themeColor={creator.themeColor}
                onGoalChange={(goal) => update({ goal })}
                onGoalTitleChange={(goalTitle) => updateSettings({ goalTitle })}
                onPresetAmountsChange={(presetAmounts) =>
                  updateSettings({ presetAmounts })
                }
                onMinDonationChange={(minDonation) =>
                  updateSettings({ minDonation })
                }
              />
            )}

            {tab === "interacao" && (
              <div className="space-y-5">
                <TipPageTtsSettings
                  enabled={s.tipTtsEnabled ?? false}
                  voices={s.tipTtsVoices ?? []}
                  onEnabledChange={(tipTtsEnabled) => updateSettings({ tipTtsEnabled })}
                  onVoicesChange={(tipTtsVoices) => updateSettings({ tipTtsVoices })}
                />

                <div className="space-y-3 border-t border-zinc-800 pt-5">
                  <ToggleCard
                    checked={s.showSupporterWall}
                    onChange={(showSupporterWall) => updateSettings({ showSupporterWall })}
                    title="Mural de apoiadores"
                    description="Exibe doações recentes na página pública"
                  />
                  {s.showSupporterWall && (
                    <label className="block px-1 text-sm">
                      <div className="flex justify-between text-zinc-400">
                        <span>Máximo no mural</span>
                        <span>{s.maxSupportersVisible}</span>
                      </div>
                      <input
                        type="range"
                        min={3}
                        max={20}
                        value={s.maxSupportersVisible}
                        onChange={(e) =>
                          updateSettings({ maxSupportersVisible: Number(e.target.value) })
                        }
                        className="mt-2 w-full accent-cyan-500"
                      />
                    </label>
                  )}
                  <ToggleCard
                    checked={s.allowAnonymous}
                    onChange={(allowAnonymous) => updateSettings({ allowAnonymous })}
                    title="Doação anônima"
                    description="Apoiadores podem ocultar o nome"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Coluna de preview (fixa em telas grandes) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/45 p-3">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <h3 className="text-sm font-semibold text-white">Prévia ao vivo</h3>
              <Link
                href={tipPagePath(creator.username)}
                target="_blank"
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
              >
                Abrir →
              </Link>
            </div>
            <LivePreview creator={creator} />
            <p className="mt-2 px-1 text-[11px] text-zinc-500">
              Prévia fiel — reflete layout, cor primária e fundo exatamente como será publicada.
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <OverviewIcon name="check" className="h-4 w-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
