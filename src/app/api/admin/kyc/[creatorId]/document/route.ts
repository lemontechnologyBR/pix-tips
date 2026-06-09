import { NextResponse } from "next/server";
import {
  isAdminSessionError,
  requireAdminSession,
} from "@/lib/auth/require-admin";
import { fetchDiditDocumentImage, isDiditConfigured } from "@/lib/didit";
import {
  getKycDiditSessionId,
  getKycDocumentKey,
  readKycDocumentBuffer,
} from "@/lib/repositories/kyc-repository";

type DocumentKind = "front" | "back" | "selfie";

function imageResponse(buffer: Buffer, contentType: string): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
    },
  });
}

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

  const documentKind = kind as DocumentKind;
  const key = await getKycDocumentKey(creatorId, documentKind);
  if (key) {
    const file = await readKycDocumentBuffer(key);
    if (file) {
      return imageResponse(file.buffer, file.contentType);
    }
  }

  const diditSessionId = await getKycDiditSessionId(creatorId);
  if (diditSessionId && isDiditConfigured()) {
    const diditFile = await fetchDiditDocumentImage(diditSessionId, documentKind);
    if (diditFile) {
      return imageResponse(diditFile.buffer, diditFile.contentType);
    }
  }

  return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
}
