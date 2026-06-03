import { v4 as uuidv4 } from "uuid";
import {
  UPLOAD_RATE_LIMIT,
  getMaxMediaCount,
} from "@/lib/alert-media-config";
import { deleteFile, uploadFile } from "@/lib/storage";
import { extensionToFileType, mimeToFileType } from "@/lib/validate-alert-media";
import { prisma } from "@/lib/db";
import type { AlertMediaRecord, BackgroundMediaType } from "@/types";

const uploadCounts = new Map<string, { count: number; resetAt: number }>();

function storageKey(userId: string, filename: string): string {
  return `${userId}/backgrounds/${filename}`;
}

function toRecord(row: {
  id: string;
  creatorId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  width: number;
  height: number;
  url: string;
  createdAt: Date;
}): AlertMediaRecord {
  return {
    mediaId: row.id,
    userId: row.creatorId,
    fileName: row.fileName,
    fileSize: row.fileSize,
    fileType: row.fileType as BackgroundMediaType,
    width: row.width,
    height: row.height,
    url: row.url,
    thumbnailUrl: row.url,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getUserMedia(userId: string): Promise<AlertMediaRecord[]> {
  const rows = await prisma.alertMedia.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRecord);
}

export async function getMediaById(
  userId: string,
  mediaId: string,
): Promise<AlertMediaRecord | undefined> {
  const row = await prisma.alertMedia.findFirst({
    where: { id: mediaId, creatorId: userId },
  });
  return row ? toRecord(row) : undefined;
}

export function checkUploadRateLimit(userId: string): boolean {
  const limit = UPLOAD_RATE_LIMIT;
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

export async function canAddMedia(userId: string): Promise<boolean> {
  const count = await prisma.alertMedia.count({ where: { creatorId: userId } });
  return count < getMaxMediaCount();
}

export async function saveMediaFile(input: {
  userId: string;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  width: number;
  height: number;
}): Promise<AlertMediaRecord> {
  if (!(await canAddMedia(input.userId))) {
    throw new Error("LIMIT_REACHED");
  }

  const fileType =
    mimeToFileType(input.mimeType) ?? extensionToFileType(input.originalName);
  if (!fileType) throw new Error("INVALID_TYPE");

  const mediaId = uuidv4();
  const safeName = `${mediaId}.${fileType}`;
  const key = storageKey(input.userId, safeName);
  const url = await uploadFile(key, input.buffer, input.mimeType);

  const safeFileName = input.originalName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);

  const row = await prisma.alertMedia.create({
    data: {
      id: mediaId,
      creatorId: input.userId,
      fileName: safeFileName,
      fileSize: input.buffer.length,
      fileType: fileType as string,
      width: input.width,
      height: input.height,
      url,
    },
  });

  return toRecord(row);
}

export async function deleteMedia(userId: string, mediaId: string): Promise<boolean> {
  const row = await prisma.alertMedia.findFirst({
    where: { id: mediaId, creatorId: userId },
  });
  if (!row) return false;

  await prisma.alertMedia.delete({ where: { id: mediaId } });

  const key = storageKey(userId, `${mediaId}.${row.fileType}`);
  try {
    await deleteFile(key);
  } catch {
    // arquivo pode já ter sido removido
  }

  return true;
}

export async function replaceMediaFile(input: {
  userId: string;
  mediaId: string;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  width: number;
  height: number;
}): Promise<AlertMediaRecord | null> {
  const existing = await getMediaById(input.userId, input.mediaId);
  if (!existing) return null;

  await deleteMedia(input.userId, input.mediaId);
  return saveMediaFile({
    userId: input.userId,
    buffer: input.buffer,
    originalName: input.originalName,
    mimeType: input.mimeType,
    width: input.width,
    height: input.height,
  });
}
