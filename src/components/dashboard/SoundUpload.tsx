"use client";

import { useRef, useState } from "react";
import {
  formatSoundSizeLimit,
  getMaxCustomSoundCount,
} from "@/lib/sound-store-config";
import type { CustomSoundRecord } from "@/types";

interface SoundUploadProps {
  currentCount: number;
  onUploaded: (record: CustomSoundRecord) => void;
}

export function SoundUpload({ currentCount, onUploaded }: SoundUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const maxCount = getMaxCustomSoundCount();
  const atLimit = currentCount >= maxCount;
  const sizeLimit = formatSoundSizeLimit();

  async function uploadFile(file: File) {
    if (atLimit) {
      setError(`Limite de ${maxCount} sons atingido.`);
      return;
    }

    if (!file.name.match(/\.(mp3|wav)$/i) && !file.type.match(/^audio\/(mpeg|mp3|wav|x-wav|wave)$/)) {
      setError("Use arquivos MP3 ou WAV.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);
    form.append("name", file.name.replace(/\.[^.]+$/, ""));

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const record = JSON.parse(xhr.responseText) as CustomSoundRecord;
            onUploaded(record);
            resolve();
          } else {
            try {
              const data = JSON.parse(xhr.responseText) as { error?: string };
              reject(new Error(data.error ?? "Erro ao enviar"));
            } catch {
              reject(new Error("Erro ao enviar"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Erro de rede"));
        xhr.open("POST", "/api/user/custom-sounds");
        xhr.send(form);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void uploadFile(file);
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !atLimit && !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!atLimit && !uploading) inputRef.current?.click();
          }
        }}
        className={`rounded-lg border border-dashed p-4 text-center transition-colors ${
          atLimit
            ? "cursor-not-allowed border-zinc-800 opacity-50"
            : dragOver
              ? "border-cyan-500 bg-cyan-500/10 cursor-pointer"
              : "border-zinc-700 hover:border-cyan-500/50 cursor-pointer"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,.mp3,.wav"
          className="hidden"
          disabled={atLimit || uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Enviando... {progress}%</p>
            <div className="mx-auto h-1.5 max-w-xs overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-cyan-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : atLimit ? (
          <p className="text-sm text-zinc-500">
            Limite de {maxCount} sons atingido
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-300">Arraste MP3/WAV ou clique para enviar</p>
            <p className="mt-1 text-xs text-zinc-500">
              Máx. {sizeLimit} · {currentCount}/{maxCount} sons
            </p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
