"use client";

import { useEffect, useRef, useState } from "react";
import { getMinOpacity, templateSupportsBackground } from "@/lib/alert-media-config";
import { formatFileSize, validateImageDimensions } from "@/lib/validate-alert-media";
import type {
  AlertMediaRecord,
  AlertSettings,
  BackgroundMediaConfig,
  BackgroundFit,
  BackgroundPosition,
} from "@/types";
import { DEFAULT_BACKGROUND_MEDIA } from "@/types";

type UploadState = "empty" | "uploading" | "uploaded" | "error" | "removing";

interface BackgroundMediaUploaderProps {
  settings: AlertSettings;
  onChange: (backgroundMedia: BackgroundMediaConfig) => void;
}

const POSITIONS: { id: BackgroundPosition; label: string }[] = [
  { id: "top left", label: "↖" },
  { id: "top center", label: "↑" },
  { id: "top right", label: "↗" },
  { id: "center left", label: "←" },
  { id: "center", label: "●" },
  { id: "center right", label: "→" },
  { id: "bottom left", label: "↙" },
  { id: "bottom center", label: "↓" },
  { id: "bottom right", label: "↘" },
];

export function BackgroundMediaUploader({
  settings,
  onChange,
}: BackgroundMediaUploaderProps) {
  const bg = settings.backgroundMedia ?? DEFAULT_BACKGROUND_MEDIA;
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [library, setLibrary] = useState<AlertMediaRecord[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const supports = templateSupportsBackground(settings.templateId);
  const minOpacity = getMinOpacity();
  const maxMb = 20;

  const viewState: UploadState = errorMsg
    ? "error"
    : isUploading
      ? "uploading"
      : isRemoving
        ? "removing"
        : bg.url
          ? "uploaded"
          : "empty";

  useEffect(() => {
    if (!supports) return;
    let cancelled = false;
    fetch("/api/user/alert-media")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items: AlertMediaRecord[] }) => {
        if (!cancelled) setLibrary(data.items);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [supports]);

  if (!supports) return null;

  function patch(partial: Partial<BackgroundMediaConfig>) {
    onChange({ ...bg, ...partial });
  }

  function applyRecord(record: AlertMediaRecord) {
    onChange({
      ...bg,
      mediaId: record.mediaId,
      url: record.url,
      thumbnailUrl: record.thumbnailUrl,
      fileName: record.fileName,
      fileSize: record.fileSize,
      fileType: record.fileType,
      width: record.width,
      height: record.height,
      useBackgroundMedia: true,
    });
    setErrorMsg("");
  }

  async function refreshLibrary() {
    const res = await fetch("/api/user/alert-media");
    if (res.ok) {
      const data = (await res.json()) as { items: AlertMediaRecord[] };
      setLibrary(data.items);
    }
  }

  function uploadFile(file: File) {
    validateImageDimensions(file).then(async (result) => {
      if (!result.ok) {
        setErrorMsg(result.message ?? "Arquivo inválido.");
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setIsUploading(true);
      setProgress(0);
      setErrorMsg("");

      const form = new FormData();
      form.append("file", file);
      form.append("templateId", settings.templateId);
      form.append("width", String(result.width ?? 0));
      form.append("height", String(result.height ?? 0));

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
        xhrRef.current = null;

        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText) as AlertMediaRecord;
          applyRecord(data);
          setIsUploading(false);
          refreshLibrary();
          return;
        }

        let msg = "Erro de conexão. Verifique sua internet e tente novamente.";
        try {
          const err = JSON.parse(xhr.responseText) as { error?: string };
          if (err.error) msg = err.error;
        } catch {
          // ignore
        }
        setIsUploading(false);
        setErrorMsg(msg);
      };

      xhr.onerror = () => {
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
        xhrRef.current = null;
        setIsUploading(false);
        setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente.");
      };

      xhr.onabort = () => {
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
        xhrRef.current = null;
        setIsUploading(false);
        setProgress(0);
      };

      xhr.open("POST", "/api/user/alert-media");
      xhr.send(form);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function cancelUpload() {
    xhrRef.current?.abort();
  }

  async function removeMedia() {
    if (!bg.mediaId) {
      onChange({ ...DEFAULT_BACKGROUND_MEDIA });
      return;
    }

    setIsRemoving(true);
    try {
      await fetch(`/api/user/alert-media/${bg.mediaId}`, { method: "DELETE" });
      onChange({ ...DEFAULT_BACKGROUND_MEDIA });
      refreshLibrary();
    } catch {
      setErrorMsg("Erro ao remover mídia.");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <section className="border-t border-zinc-800/80 pt-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-medium text-zinc-400">Fundo personalizado</h3>
          <p className="text-[10px] text-zinc-600">
            PNG, JPG, GIF · até {maxMb} MB
          </p>
        </div>
        {library.length > 0 && (
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="text-[10px] text-cyan-400 hover:text-cyan-300"
          >
            Galeria ({library.length})
          </button>
        )}
      </div>

      {viewState === "empty" && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3 py-3 transition ${
            dragOver
              ? "border-cyan-400 bg-cyan-500/10"
              : "border-zinc-700 bg-zinc-950/50 hover:border-zinc-500"
          }`}
        >
          <span className="text-xl">🖼</span>
          <div className="min-w-0 text-left">
            <p className="text-xs font-medium text-zinc-200">
              Arraste ou clique para enviar
            </p>
            <p className="text-[10px] text-zinc-600">1920×1080 recomendado</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {viewState === "uploading" && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="mx-auto mb-3 h-24 max-w-full rounded object-contain"
            />
          )}
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-zinc-400">Enviando... {progress}%</p>
          <button
            type="button"
            onClick={cancelUpload}
            className="mt-3 w-full rounded-lg border border-zinc-700 py-1.5 text-xs text-zinc-400 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      )}

      {(viewState === "uploaded" || viewState === "removing") && bg.url && (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bg.url}
              alt=""
              className="mx-auto max-h-24 w-full object-contain"
              style={{
                opacity: bg.opacity,
                objectFit: bg.fit === "stretch" ? "fill" : bg.fit,
                objectPosition: bg.position,
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-zinc-500">
            <span className="truncate" title={bg.fileName ?? ""}>
              {bg.fileName}
            </span>
            <span className="text-right uppercase">{bg.fileType}</span>
            <span>{bg.fileSize ? formatFileSize(bg.fileSize) : "—"}</span>
            <span className="text-right">
              {bg.width && bg.height ? `${bg.width} × ${bg.height}` : "—"}
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={bg.useBackgroundMedia}
              onChange={(e) => patch({ useBackgroundMedia: e.target.checked })}
              className="rounded"
            />
            Usar como fundo do alerta
          </label>

          <label className="block text-xs">
            <span className="text-zinc-500">
              Opacidade ({Math.round(bg.opacity * 100)}%)
            </span>
            <input
              type="range"
              min={minOpacity * 100}
              max={100}
              value={Math.round(bg.opacity * 100)}
              onChange={(e) => patch({ opacity: Number(e.target.value) / 100 })}
              className="mt-1 w-full"
            />
          </label>

          <details className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-2 py-1.5">
            <summary className="cursor-pointer select-none py-1 text-[11px] text-zinc-400">
              Ajustes de posição e filtros
            </summary>
            <div className="space-y-2 pb-2 pt-1">
              <div className="flex flex-wrap gap-1.5 text-xs">
                {(["cover", "contain", "stretch"] as BackgroundFit[]).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => patch({ fit })}
                    className={`rounded px-2 py-0.5 text-[11px] ${
                      bg.fit === fit
                        ? "bg-cyan-500 text-white"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {fit === "cover" ? "Preencher" : fit === "contain" ? "Centralizar" : "Esticar"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-9 gap-0.5">
                {POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    title={p.id}
                    onClick={() => patch({ position: p.id })}
                    className={`rounded py-0.5 text-[10px] ${
                      bg.position === p.id
                        ? "bg-cyan-500 text-white"
                        : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2 border-t border-zinc-800 pt-2">
                  <label className="block text-xs">
                    <span className="text-zinc-500">Blur ({bg.filters.blur}px)</span>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={bg.filters.blur}
                      onChange={(e) =>
                        patch({
                          filters: { ...bg.filters, blur: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-zinc-500">Brilho ({bg.filters.brightness}%)</span>
                    <input
                      type="range"
                      min={50}
                      max={150}
                      value={bg.filters.brightness}
                      onChange={(e) =>
                        patch({
                          filters: { ...bg.filters, brightness: Number(e.target.value) },
                        })
                      }
                      className="mt-1 w-full"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={bg.filters.grayscale}
                      onChange={(e) =>
                        patch({
                          filters: { ...bg.filters, grayscale: e.target.checked },
                        })
                      }
                    />
                    Escala de cinza
                  </label>
                </div>
            </div>
          </details>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={viewState === "removing"}
              onClick={() => inputRef.current?.click()}
              className="flex-1 rounded-lg border border-zinc-700 py-1.5 text-xs hover:border-cyan-500"
            >
              Substituir
            </button>
            <button
              type="button"
              disabled={viewState === "removing"}
              onClick={removeMedia}
              className="rounded-lg border border-red-900/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/30"
            >
              {viewState === "removing" ? "..." : "🗑"}
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {viewState === "error" && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-center">
          <span className="text-2xl">✕</span>
          <p className="mt-2 text-sm text-red-300">{errorMsg}</p>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="mt-3 rounded-lg bg-zinc-800 px-4 py-1.5 text-xs hover:bg-zinc-700"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <h4 className="font-semibold">Minhas mídias</h4>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto p-4">
              {library.map((item) => (
                <button
                  key={item.mediaId}
                  type="button"
                  onClick={() => {
                    applyRecord(item);
                    setShowLibrary(false);
                  }}
                  className="overflow-hidden rounded-lg border border-zinc-800 hover:border-cyan-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                  <p className="truncate px-1 py-1 text-[10px] text-zinc-400">
                    {item.fileName}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
