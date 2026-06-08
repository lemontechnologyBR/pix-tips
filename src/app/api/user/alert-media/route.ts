import { NextResponse } from "next/server";
import {
  MAX_HEIGHT,
  MAX_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
  getMaxFileSize,
} from "@/lib/alert-media-config";
import {
  canAddMedia,
  checkUploadRateLimit,
  getUserMedia,
  saveMediaFile,
} from "@/lib/media-store";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { mimeToFileType } from "@/lib/validate-alert-media";
import { getAdminSettings } from "@/lib/repositories/admin-settings-repository";

function isValidMediaBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isWebP =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;
  const isGif =
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38;
  return isJpeg || isPng || isWebP || isGif;
}

function readPngDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;
  return NextResponse.json({ items: await getUserMedia(session.creator.id) });
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;
    const creator = session.creator;
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    const { uploadLimitMb } = await getAdminSettings();
    const adminLimitBytes = uploadLimitMb * 1024 * 1024;
    if (file.size > adminLimitBytes) {
      return NextResponse.json(
        { error: `Arquivo excede o limite de ${uploadLimitMb} MB` },
        { status: 413 },
      );
    }

    if (!checkUploadRateLimit(creator.id)) {
      return NextResponse.json(
        { error: "Limite de uploads excedido. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    if (!(await canAddMedia(creator.id))) {
      return NextResponse.json({ error: "Limite de mídias atingido. Remova uma para continuar." }, { status: 400 });
    }

    const mime = file.type;
    const fileType = mimeToFileType(mime);
    if (!fileType) {
      return NextResponse.json(
        { error: "Formato não suportado. Use PNG, JPG, GIF ou WebP." },
        { status: 400 },
      );
    }

    const maxSize = getMaxFileSize();
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Limite: 20 MB.` },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isValidMediaBuffer(buffer)) {
      return NextResponse.json({ error: "Tipo de arquivo inválido" }, { status: 400 });
    }

    const fromPng = readPngDimensions(buffer);
    const width = fromPng?.width ?? (Number(form.get("width")) || 0);
    const height = fromPng?.height ?? (Number(form.get("height")) || 0);

    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
      return NextResponse.json(
        { error: `Dimensões mínimas: ${MIN_WIDTH}x${MIN_HEIGHT}px.` },
        { status: 400 },
      );
    }
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      return NextResponse.json(
        { error: `Dimensões máximas: ${MAX_WIDTH}x${MAX_HEIGHT}px.` },
        { status: 400 },
      );
    }

    const record = await saveMediaFile({
      userId: creator.id,
      buffer,
      originalName: file.name,
      mimeType: mime,
      width,
      height,
    });

    return NextResponse.json(
      {
        mediaId: record.mediaId,
        url: record.url,
        thumbnailUrl: record.thumbnailUrl,
        fileName: record.fileName,
        fileSize: record.fileSize,
        fileType: record.fileType,
        width: record.width,
        height: record.height,
        createdAt: record.createdAt,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    if (message === "LIMIT_REACHED") {
      return NextResponse.json({ error: "Limite de mídias atingido." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao enviar arquivo" }, { status: 500 });
  }
}
