import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  MAX_HEIGHT,
  MAX_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
  getMaxFileSize,
} from "@/lib/alert-media-config";
import type { BackgroundMediaType } from "@/types";

export type MediaValidationError =
  | "format"
  | "size"
  | "dimensions-min"
  | "dimensions-max"
  | "load-failed";

export interface MediaValidationResult {
  ok: boolean;
  error?: MediaValidationError;
  message?: string;
  width?: number;
  height?: number;
  fileType?: BackgroundMediaType;
}

export function mimeToFileType(mime: string): BackgroundMediaType | null {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export function extensionToFileType(name: string): BackgroundMediaType | null {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  if (ext === ".png") return "png";
  if (ext === ".jpg" || ext === ".jpeg") return "jpg";
  if (ext === ".gif") return "gif";
  if (ext === ".webp") return "webp";
  return null;
}

export function validateFileBasics(file: File): MediaValidationResult {
  const fileType = mimeToFileType(file.type) ?? extensionToFileType(file.name);
  if (!fileType || !ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
    const extOk = ACCEPTED_EXTENSIONS.some((e) => file.name.toLowerCase().endsWith(e));
    if (!extOk || !fileType) {
      return {
        ok: false,
        error: "format",
        message: "Formato não suportado. Use PNG, JPG, GIF ou WebP.",
      };
    }
  }

  const maxSize = getMaxFileSize();
  if (file.size > maxSize) {
    return {
      ok: false,
      error: "size",
      message: `Arquivo muito grande. O limite é 20 MB.`,
    };
  }

  return { ok: true, fileType: fileType ?? undefined };
}

export async function validateImageDimensions(
  file: File,
): Promise<MediaValidationResult> {
  const basics = validateFileBasics(file);
  if (!basics.ok) return basics;

  try {
    const dims = await readImageDimensions(file);
    if (dims.width < MIN_WIDTH || dims.height < MIN_HEIGHT) {
      return {
        ok: false,
        error: "dimensions-min",
        message: `Dimensões muito pequenas. Mínimo: ${MIN_WIDTH}x${MIN_HEIGHT}px.`,
      };
    }
    if (dims.width > MAX_WIDTH || dims.height > MAX_HEIGHT) {
      return {
        ok: false,
        error: "dimensions-max",
        message: `Dimensões muito grandes. Máximo: ${MAX_WIDTH}x${MAX_HEIGHT}px.`,
      };
    }
    return {
      ok: true,
      width: dims.width,
      height: dims.height,
      fileType: basics.fileType,
    };
  } catch {
    return {
      ok: false,
      error: "load-failed",
      message: "Não foi possível ler a imagem. Tente outro arquivo.",
    };
  }
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load failed"));
    };
    img.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
