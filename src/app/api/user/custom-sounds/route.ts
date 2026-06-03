import { NextResponse } from "next/server";
import {
  formatSoundSizeLimit,
  getMaxCustomSoundCount,
  getMaxSoundFileSize,
  mimeToSoundType,
} from "@/lib/sound-store-config";
import {
  canAddCustomSound,
  checkSoundUploadRateLimit,
  getUserCustomSounds,
  saveCustomSoundFile,
} from "@/lib/sound-store";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { getAdminSettings } from "@/lib/repositories/admin-settings-repository";

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;
  return NextResponse.json({ items: await getUserCustomSounds(session.creator.id) });
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

    if (!checkSoundUploadRateLimit(creator.id)) {
      return NextResponse.json(
        { error: "Limite de uploads excedido. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    if (!(await canAddCustomSound(creator.id))) {
      const max = getMaxCustomSoundCount();
      return NextResponse.json(
        { error: `Limite de ${max} sons personalizados atingido. Remova um som para continuar.` },
        { status: 400 },
      );
    }

    const mime = file.type;
    if (!mimeToSoundType(mime) && !file.name.match(/\.(mp3|wav)$/i)) {
      return NextResponse.json(
        { error: "Formato não suportado. Use MP3 ou WAV." },
        { status: 400 },
      );
    }

    const maxSize = getMaxSoundFileSize();
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Limite: ${formatSoundSizeLimit()}.` },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const displayName = form.get("name");
    const record = await saveCustomSoundFile({
      userId: creator.id,
      buffer,
      originalName: file.name,
      mimeType: mime || "application/octet-stream",
      displayName: typeof displayName === "string" ? displayName : undefined,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    if (message === "LIMIT_REACHED") {
      return NextResponse.json({ error: "Limite de sons atingido." }, { status: 400 });
    }
    if (message === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "Arquivo muito grande." }, { status: 413 });
    }
    if (message === "INVALID_TYPE") {
      return NextResponse.json({ error: "Formato não suportado." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao enviar som" }, { status: 500 });
  }
}
