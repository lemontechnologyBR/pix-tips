import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import {
  getKycDocumentKey,
  readKycDocumentBuffer,
} from "@/lib/repositories/kyc-repository";
import { getPresignedUrl } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creatorId: string }> },
) {
  const session = await requireAdminSession();
  if (isAdminSessionError(session)) return session;

  const { creatorId } = await params;
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");

  if (kind !== "front" && kind !== "back" && kind !== "selfie") {
    return NextResponse.json({ error: "Tipo de documento inválido." }, { status: 400 });
  }

  const key = await getKycDocumentKey(creatorId, kind);
  if (!key) {
    return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
  }

  // Em produção com S3/R2: redireciona para URL pré-assinada (expira em 5 min)
  const presignedUrl = await getPresignedUrl(key);
  if (presignedUrl) {
    return NextResponse.redirect(presignedUrl, { status: 302 });
  }

  // Local / dev: proxy pelo servidor (arquivos fora de public/)
  const file = await readKycDocumentBuffer(key);
  if (!file) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
