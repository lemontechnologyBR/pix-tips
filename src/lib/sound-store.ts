import { v4 as uuidv4 } from "uuid";
import {
  UPLOAD_RATE_LIMIT_SOUNDS,
  extensionToSoundType,
  getMaxCustomSoundCount,
  getMaxSoundFileSize,
  mimeToSoundType,
  type CustomSoundFileType,
} from "@/lib/sound-store-config";
import { deleteFile, uploadFile } from "@/lib/storage";
import { prisma } from "@/lib/db";
import type { CustomSoundRecord } from "@/types";

const uploadCounts = new Map<string, { count: number; resetAt: number }>();

function storageKey(userId: string, filename: string): string {
  return `${userId}/sounds/${filename}`;
}

function toRecord(row: {
  id: string;
  creatorId: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  createdAt: Date;
}): CustomSoundRecord {
  return {
    id: row.id,
    userId: row.creatorId,
    name: row.name,
    fileName: row.fileName,
    fileSize: row.fileSize,
    fileType: row.fileType as CustomSoundFileType,
    url: row.url,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getUserCustomSounds(userId: string): Promise<CustomSoundRecord[]> {
  const rows = await prisma.customSound.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRecord);
}

export async function getCustomSoundById(
  userId: string,
  soundId: string,
): Promise<CustomSoundRecord | undefined> {
  const row = await prisma.customSound.findFirst({
    where: { id: soundId, creatorId: userId },
  });
  return row ? toRecord(row) : undefined;
}

export function checkSoundUploadRateLimit(userId: string): boolean {
  const limit = UPLOAD_RATE_LIMIT_SOUNDS;
  const now = Date.now();
  const entry = uploadCounts.get(userId);

  if (!entry || now > entry.resetAt) {
    uploadCounts.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export async function canAddCustomSound(userId: string): Promise<boolean> {
  const count = await prisma.customSound.count({ where: { creatorId: userId } });
  return count < getMaxCustomSoundCount();
}

export async function saveCustomSoundFile(input: {
  userId: string;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  displayName?: string;
}): Promise<CustomSoundRecord> {
  if (!(await canAddCustomSound(input.userId))) {
    throw new Error("LIMIT_REACHED");
  }

  const maxSize = getMaxSoundFileSize();
  if (input.buffer.length > maxSize) {
    throw new Error("FILE_TOO_LARGE");
  }

  const fileType: CustomSoundFileType | null =
    mimeToSoundType(input.mimeType) ?? extensionToSoundType(input.originalName);
  if (!fileType) throw new Error("INVALID_TYPE");

  const id = uuidv4();
  const safeName = `${id}.${fileType}`;
  const key = storageKey(input.userId, safeName);
  const url = await uploadFile(
    key,
    input.buffer,
    input.mimeType || "application/octet-stream",
  );

  const name =
    input.displayName?.trim().slice(0, 80) ||
    input.originalName
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9._\-\s]/g, "_")
      .slice(0, 80);
  const fileName = input.originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);

  const row = await prisma.customSound.create({
    data: {
      id,
      creatorId: input.userId,
      name,
      fileName,
      fileSize: input.buffer.length,
      fileType: fileType as string,
      url,
    },
  });

  return toRecord(row);
}

export async function deleteCustomSound(userId: string, soundId: string): Promise<boolean> {
  const row = await prisma.customSound.findFirst({
    where: { id: soundId, creatorId: userId },
  });
  if (!row) return false;

  await prisma.customSound.delete({ where: { id: soundId } });

  const key = storageKey(userId, `${soundId}.${row.fileType}`);
  try {
    await deleteFile(key);
  } catch {
    // arquivo pode já ter sido removido
  }

  return true;
}
