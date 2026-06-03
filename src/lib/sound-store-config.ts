export const MAX_SOUND_SIZE = 2 * 1024 * 1024;
export const MAX_CUSTOM_SOUNDS = 20;
export const UPLOAD_RATE_LIMIT_SOUNDS = 30;

export const ALLOWED_SOUND_EXTENSIONS = ["mp3", "wav"] as const;
export type CustomSoundFileType = (typeof ALLOWED_SOUND_EXTENSIONS)[number];

const MIME_MAP: Record<string, CustomSoundFileType> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
};

export function getMaxSoundFileSize(): number {
  return MAX_SOUND_SIZE;
}

export function getMaxCustomSoundCount(): number {
  return MAX_CUSTOM_SOUNDS;
}

export function mimeToSoundType(mime: string): CustomSoundFileType | null {
  return MIME_MAP[mime.toLowerCase()] ?? null;
}

export function extensionToSoundType(filename: string): CustomSoundFileType | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "mp3" || ext === "wav") return ext;
  return null;
}

export function formatSoundSizeLimit(): string {
  const kb = MAX_SOUND_SIZE / 1024;
  return kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`;
}
