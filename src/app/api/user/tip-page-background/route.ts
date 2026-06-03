import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { uploadFile } from "@/lib/storage";

const MAX_SIZE = 3 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

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
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 3 MB." },
        { status: 400 },
      );
    }

    const ext =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const key = `${session.creator.id}/tip-page-bg/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(key, buffer, file.type);

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar imagem" }, { status: 500 });
  }
}
