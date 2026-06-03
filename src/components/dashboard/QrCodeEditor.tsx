"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { SITE_URL, tipPagePath } from "@/lib/brand";
import { normalizeQrCodeSettings } from "@/lib/qr-code-defaults";
import { downloadBlob, renderQrCardToBlob } from "@/lib/qr-code-render";
import type { Creator, QrCodeSettings } from "@/types";
import { QrCodePreviewCard } from "./QrCodePreviewCard";
import {
  QrCodeAppearanceControls,
  QrCodeStyleControls,
  QrCodeWidgetControls,
} from "./QrCodeStyleControls";

type TabId = "integration" | "qrcode" | "config";

const STANDALONE_TABS: { id: TabId; label: string }[] = [
  { id: "integration", label: "Integração" },
  { id: "qrcode", label: "QR Code" },
  { id: "config", label: "Configuração" },
];

const EMBEDDED_TABS: { id: TabId; label: string }[] = [
  { id: "integration", label: "Link & OBS" },
  { id: "qrcode", label: "Aparência" },
];

interface QrCodeEditorProps {
  initialCreator: Creator;
  widgetUrl: string;
  embedded?: boolean;
}

export function QrCodeEditor({ initialCreator, widgetUrl, embedded = false }: QrCodeEditorProps) {
  const [creator, setCreator] = useState(initialCreator);
  const [tab, setTab] = useState<TabId>(embedded ? "qrcode" : "qrcode");
  const tabs = embedded ? EMBEDDED_TABS : STANDALONE_TABS;
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const qrSettings = useMemo(
    () => normalizeQrCodeSettings(creator.tipPageSettings.qrCodeSettings),
    [creator.tipPageSettings.qrCodeSettings],
  );

  const pagePath = tipPagePath(creator.username);
  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${pagePath}`
      : `${SITE_URL}${pagePath}`;
  const displayUrl = pageUrl.replace(/^https?:\/\//, "");
  const widgetPath = widgetUrl.replace(/^https?:\/\/[^/]+/, "");

  const updateQr = useCallback((patch: Partial<QrCodeSettings>) => {
    setCreator((c) => ({
      ...c,
      tipPageSettings: {
        ...c.tipPageSettings,
        qrCodeSettings: normalizeQrCodeSettings({
          ...normalizeQrCodeSettings(c.tipPageSettings.qrCodeSettings),
          ...patch,
        }),
      },
    }));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/tip-page-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creator),
      });
      if (res.ok) {
        setToast("Configurações salvas!");
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await renderQrCardToBlob({
        pageUrl,
        settings: qrSettings,
        avatarUrl: creator.avatar,
        plan: creator.plan,
      });
      downloadBlob(blob, `qrcode-${creator.username}.png`);
    } finally {
      setDownloading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(pageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function copyWidget() {
    const full =
      typeof window !== "undefined" && !widgetUrl.startsWith("http")
        ? `${window.location.origin}${widgetUrl}`
        : widgetUrl;
    await navigator.clipboard.writeText(full);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2000);
  }

  return (
    <div className="w-full space-y-5">
      {!embedded && (
        <div>
          <h1 className="text-xl font-bold text-white">QR Code da sua página</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Personalize o cartão, use como widget no OBS ou baixe para compartilhar.
          </p>
        </div>
      )}

      <div
        className={
          embedded
            ? "flex flex-wrap gap-2 border-b border-zinc-800 pb-3"
            : "flex flex-wrap gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1"
        }
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              embedded
                ? `border-b-2 px-1 pb-2 text-sm font-medium transition ${
                    tab === t.id
                      ? "border-cyan-500 text-cyan-300"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`
                : `rounded-lg px-4 py-2 text-sm font-medium transition ${
                    tab === t.id
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`
            }
          >
            {t.label}
          </button>
        ))}
        {!embedded && (
          <>
            <Link
              href="/dashboard/tip-page"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            >
              Minha página →
            </Link>
            <Link
              href="/dashboard/widgets?tab=alerts"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            >
              Alertas →
            </Link>
          </>
        )}
      </div>

      {tab === "integration" && (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
          Escaneie o QR Code no preview ao lado para confirmar que o link está correto.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(260px,20rem)]">
        <div className="space-y-4">
          {tab === "integration" && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-6">
              <div className="space-y-4">
                <h2 className="font-semibold">Link da sua página</h2>
                <p className="text-sm text-zinc-400">
                  O QR Code aponta para esta URL. Compartilhe onde quiser.
                </p>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-cyan-300">
                  {displayUrl}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700"
                  >
                    {copiedLink ? "Copiado!" : "Copiar link"}
                  </button>
                  <Link
                    href={pagePath}
                    target="_blank"
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
                  >
                    Abrir página
                  </Link>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-5 space-y-4">
                <h2 className="font-semibold">Widget OBS</h2>
                <p className="text-sm text-zinc-400">
                  Adicione como fonte <strong className="font-medium text-zinc-300">Navegador</strong> no
                  OBS. Fundo transparente, animação e posição configuráveis na aba Configuração.
                </p>
                <div
                  className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/90"
                  title={widgetUrl}
                >
                  <p className="truncate px-3 py-2 font-mono text-[11px] text-zinc-500">
                    {widgetPath}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:max-w-md">
                  <button
                    type="button"
                    onClick={copyWidget}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      copiedWidget
                        ? "border-emerald-500/50 bg-emerald-600/15 text-emerald-300"
                        : "border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:border-zinc-600"
                    }`}
                  >
                    {copiedWidget ? "Link copiado!" : "Copiar link OBS"}
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
                <p className="text-[11px] text-zinc-600">
                  Após salvar alterações, atualize a fonte no OBS (botão Atualizar) para ver mudanças.
                </p>
              </div>
            </section>
          )}

          {tab === "qrcode" && (
            <>
              {!embedded && (
                <h2 className="text-lg font-semibold">
                  Crie seu QR Code com seu toque pessoal
                </h2>
              )}
              <QrCodeStyleControls
                title="Estilo do link"
                style={qrSettings.linkStyle}
                onChange={(patch) =>
                  updateQr({ linkStyle: { ...qrSettings.linkStyle, ...patch } })
                }
              />
              <QrCodeStyleControls
                title="Estilo da descrição"
                style={qrSettings.descriptionStyle}
                showDescriptionField
                description={qrSettings.description}
                onDescriptionChange={(description) => updateQr({ description })}
                onChange={(patch) =>
                  updateQr({ descriptionStyle: { ...qrSettings.descriptionStyle, ...patch } })
                }
              />
              <QrCodeAppearanceControls settings={qrSettings} onChange={updateQr} />
              <QrCodeWidgetControls settings={qrSettings} onChange={updateQr} />
            </>
          )}

          {tab === "config" && !embedded && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
              <h2 className="font-semibold">Configuração geral</h2>
              <p className="text-sm text-zinc-400">
                Meta, valores de doação e identidade visual ficam em{" "}
                <Link href="/dashboard/tip-page" className="text-cyan-400 hover:underline">
                  Minha página
                </Link>
                .
              </p>
              <QrCodeWidgetControls settings={qrSettings} onChange={updateQr} />
              <QrCodeAppearanceControls settings={qrSettings} onChange={updateQr} />
            </section>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg web3-btn-primary px-5 py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start space-y-4">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-zinc-500">
            Preview
          </p>
          <QrCodePreviewCard
            pageUrl={pageUrl}
            displayUrl={displayUrl}
            settings={qrSettings}
            avatarUrl={creator.avatar}
            plan={creator.plan}
          />
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: qrSettings.cardBackground }}
          >
            {downloading ? "Gerando..." : "Baixar imagem"}
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
