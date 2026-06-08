import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { KYC_ALLOWED_MIMES, KYC_MAX_FILE_SIZE } from "@/lib/kyc";
import { getKycProfile, submitKyc, validateKycFields } from "@/lib/repositories/kyc-repository";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { uploadFile } from "@/lib/storage";
import type { KycDocumentType } from "@/types";

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

export async function GET() {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  const profile = await getKycProfile(session.creator.id);
  return NextResponse.json(profile);
}

async function uploadKycDocument(
  creatorId: string,
  file: File,
  label: string,
): Promise<{ key?: string; error?: string }> {
  if (!KYC_ALLOWED_MIMES.includes(file.type as (typeof KYC_ALLOWED_MIMES)[number])) {
    return { error: `${label}: use JPG, PNG ou WebP.` };
  }

  if (file.size > KYC_MAX_FILE_SIZE) {
    return { error: `${label}: arquivo muito grande (máx. 5 MB).` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isValidImageBuffer(buffer)) {
    return { error: `${label}: tipo de arquivo inválido.` };
  }

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `${creatorId}/kyc/${uuidv4()}.${ext}`;
  await uploadFile(key, buffer, file.type);
  return { key };
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  try {
    const form = await request.formData();
    const legalName = String(form.get("legalName") ?? "");
    const cpf = String(form.get("cpf") ?? "");
    const birthDate = String(form.get("birthDate") ?? "");
    const documentType = String(form.get("documentType") ?? "") as KycDocumentType;

    const documentFront = form.get("documentFront");
    const documentBack = form.get("documentBack");
    const selfie = form.get("selfie");

    if (!(documentFront instanceof File)) {
      return NextResponse.json({ error: "Envie a frente do documento." }, { status: 400 });
    }
    if (!(documentBack instanceof File)) {
      return NextResponse.json({ error: "Envie o verso do documento." }, { status: 400 });
    }
    if (!(selfie instanceof File)) {
      return NextResponse.json({ error: "Envie uma selfie segurando o documento." }, { status: 400 });
    }

    const validation = await validateKycFields({
      creatorId: session.creator.id,
      legalName,
      cpf,
      birthDate,
      documentType,
    });

    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const [front, back, selfieUpload] = await Promise.all([
      uploadKycDocument(session.creator.id, documentFront, "Frente do documento"),
      uploadKycDocument(session.creator.id, documentBack, "Verso do documento"),
      uploadKycDocument(session.creator.id, selfie, "Selfie"),
    ]);

    const uploadError = front.error ?? back.error ?? selfieUpload.error;
    if (uploadError || !front.key || !back.key || !selfieUpload.key) {
      return NextResponse.json({ error: uploadError ?? "Erro ao enviar documentos." }, { status: 400 });
    }

    const result = await submitKyc(
      session.creator.id,
      {
        legalName,
        cpf,
        birthDate,
        documentType,
        documentFrontKey: front.key,
        documentBackKey: back.key,
        selfieKey: selfieUpload.key,
      },
      { cpfVerification: validation.cpfVerification },
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.profile, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar verificação." }, { status: 500 });
  }
}
