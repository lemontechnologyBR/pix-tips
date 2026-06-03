import { NextResponse } from "next/server";
import { isValidCpf, normalizeCpf } from "@/lib/kyc";
import { cpfVerificationStatusLabel, resolveCpfProvider } from "@/lib/kyc/cpf-provider";
import { validateKycFields } from "@/lib/repositories/kyc-repository";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import type { KycDocumentType } from "@/types";

export async function POST(request: Request) {
  const session = await requireSession();
  if (isSessionError(session)) return session;

  try {
    const body = (await request.json()) as {
      legalName?: string;
      cpf?: string;
      birthDate?: string;
      documentType?: KycDocumentType;
    };

    const legalName = String(body.legalName ?? "").trim();
    const cpf = normalizeCpf(String(body.cpf ?? ""));
    const birthDate = String(body.birthDate ?? "");
    const documentType = (body.documentType ?? "rg") as KycDocumentType;

    if (!isValidCpf(cpf)) {
      return NextResponse.json({ ok: false, error: "CPF inválido." }, { status: 400 });
    }

    const result = await validateKycFields({
      creatorId: session.creator.id,
      legalName,
      cpf,
      birthDate,
      documentType,
    });

    if (result.error) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          provider: result.cpfVerification?.provider ?? resolveCpfProvider(),
          status: result.cpfVerification?.status ?? null,
          statusLabel: cpfVerificationStatusLabel(result.cpfVerification?.status),
        },
        { status: 400 },
      );
    }

    const verification = result.cpfVerification!;
    return NextResponse.json({
      ok: true,
      provider: verification.provider,
      status: verification.status,
      statusLabel: cpfVerificationStatusLabel(verification.status),
      message: verification.message,
      nameMatch: verification.nameMatch,
      birthDateMatch: verification.birthDateMatch,
      cpfRegular: verification.cpfRegular,
      mock: verification.mock ?? false,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro ao validar CPF." }, { status: 500 });
  }
}
