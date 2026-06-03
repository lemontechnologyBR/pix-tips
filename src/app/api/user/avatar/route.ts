import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { uploadFile } from "@/lib/storage";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

function isValidImageBuffer(buffer: Buffer): boolean {
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
  return isJpeg || isPng || isWebP;
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato não suportado. Use PNG, JPG ou WebP." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 2 MB." }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const key = `${session.creator.id}/avatar/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isValidImageBuffer(buffer)) {
      return NextResponse.json(
        { error: "Formato de imagem inválido" },
        { status: 400 },
      );
    }

    const url = await uploadFile(key, buffer, file.type);

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar avatar" }, { status: 500 });
  }
}
