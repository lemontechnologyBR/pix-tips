import { NextResponse } from "next/server";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import {
  createDiditSession,
  getDiditSessionDecision,
  isDiditConfigured,
} from "@/lib/didit";
import { getPrisma } from "@/lib/db";
import { isValidCpf, normalizeCpf } from "@/lib/kyc";
import {
  DUPLICATE_CPF_ERROR,
  getKycProfile,
  isCpfLinkedToAnotherAccount,
} from "@/lib/repositories/kyc-repository";

function callbackUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const path = "/dashboard/finance?tab=verificacao&didit=1";
  if (configured) {
    return `${configured.replace(/\/$/, "")}${path}`;
  }
  const origin = new URL(request.url).origin;
  return `${origin}${path}`;
}

const RESUMABLE_STATUSES = new Set([
  "not started",
  "in progress",
  "awaiting user",
  "resubmitted",
]);

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;

    if (!isDiditConfigured()) {
      return NextResponse.json(
        { error: "Verificação Didit não configurada na plataforma." },
        { status: 503 },
      );
    }

    const profile = await getKycProfile(session.creator.id);
    if (profile.status === "approved") {
      return NextResponse.json(
        { error: "Sua identidade já está verificada." },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as { cpf?: string };
    const cpf = normalizeCpf(String(body.cpf ?? ""));
    if (!isValidCpf(cpf)) {
      return NextResponse.json({ error: "Informe um CPF válido." }, { status: 400 });
    }
    if (await isCpfLinkedToAnotherAccount(cpf, session.creator.id)) {
      return NextResponse.json({ error: DUPLICATE_CPF_ERROR }, { status: 409 });
    }

    const existing = await getPrisma().kycVerification.findUnique({
      where: { creatorId: session.creator.id },
      select: { diditSessionId: true, cpf: true },
    });

    if (existing?.diditSessionId) {
      try {
        const decision = await getDiditSessionDecision(existing.diditSessionId);
        if (RESUMABLE_STATUSES.has(decision.status.toLowerCase())) {
          const sessionUrl = decision.session_url;
          if (sessionUrl) {
            await getPrisma().kycVerification.update({
              where: { creatorId: session.creator.id },
              data: {
                status: "pending",
                cpf,
                cpfVerificationProvider: "didit",
                cpfVerificationStatus: null,
                cpfVerificationMessage: null,
                cpfVerifiedAt: null,
                diditVerifiedAt: null,
                reviewedAt: null,
                rejectionReason: null,
              },
            });
            return NextResponse.json({
              ok: true,
              url: sessionUrl,
              sessionId: decision.session_id,
              status: decision.status,
              resumed: true,
            });
          }
        }
      } catch {
        // cria nova sessão abaixo
      }
    }

    const diditSession = await createDiditSession({
      vendorData: session.creator.id,
      callbackUrl: callbackUrl(request),
      email: session.creator.email,
    });

    await getPrisma().kycVerification.upsert({
      where: { creatorId: session.creator.id },
      create: {
        creatorId: session.creator.id,
        status: "pending",
        cpf,
        diditSessionId: diditSession.session_id,
        diditStatus: diditSession.status,
        submittedAt: new Date(),
        cpfVerificationProvider: "didit",
      },
      update: {
        status: "pending",
        cpf,
        diditSessionId: diditSession.session_id,
        diditStatus: diditSession.status,
        submittedAt: new Date(),
        reviewedAt: null,
        diditVerifiedAt: null,
        rejectionReason: null,
        cpfVerificationProvider: "didit",
        cpfVerificationStatus: null,
        cpfVerificationMessage: null,
        cpfVerifiedAt: null,
      },
    });

    return NextResponse.json({
      ok: true,
      url: diditSession.url,
      sessionId: diditSession.session_id,
      status: diditSession.status,
      resumed: false,
    });
  } catch (error) {
    console.error("[kyc/didit/session]", error);
    const message =
      error instanceof Error ? error.message : "Erro ao iniciar verificação Didit.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
