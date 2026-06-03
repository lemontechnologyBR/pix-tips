import {
  extractIdentityFromDecision,
  getDiditSessionDecision,
  mapDiditStatusToKycStatus,
  type DiditDecisionResponse,
} from "@/lib/didit";
import { getPrisma } from "@/lib/db";
import { isValidCpf, normalizeCpf } from "@/lib/kyc";
import { verifyCpfIdentity } from "@/lib/kyc/cpf-provider";
import {
  DUPLICATE_CPF_ERROR,
  getKycProfile,
  isCpfLinkedToAnotherAccount,
} from "@/lib/repositories/kyc-repository";
import type { KycProfile } from "@/types";

function rejectionReasonFromDecision(decision: DiditDecisionResponse): string | null {
  const review = decision.reviews?.[0];
  return review?.reason?.trim() || review?.comment?.trim() || "Verificação recusada pela Didit.";
}

export async function syncDiditKycForCreator(
  creatorId: string,
  sessionId?: string | null,
): Promise<KycProfile> {
  const db = getPrisma();
  const existing = await db.kycVerification.findUnique({ where: { creatorId } });

  const targetSessionId = sessionId ?? existing?.diditSessionId;
  if (!targetSessionId) {
    return getKycProfile(creatorId);
  }

  const decision = await getDiditSessionDecision(targetSessionId);
  const kycStatus = mapDiditStatusToKycStatus(decision.status);
  const identity = extractIdentityFromDecision(decision);
  const now = new Date();

  const data: {
    status: string;
    diditSessionId: string;
    diditStatus: string;
    diditVerifiedAt?: Date | null;
    submittedAt?: Date;
    reviewedAt?: Date | null;
    rejectionReason?: string | null;
    legalName?: string | null;
    cpf?: string | null;
    birthDate?: Date | null;
    documentType?: string | null;
    cpfVerificationProvider?: string | null;
    cpfVerificationStatus?: string | null;
    cpfVerificationMessage?: string | null;
    cpfVerifiedAt?: Date | null;
  } = {
    status: kycStatus,
    diditSessionId: targetSessionId,
    diditStatus: decision.status,
  };

  if (kycStatus === "approved") {
    const diditCpf =
      identity.cpf && isValidCpf(identity.cpf) ? normalizeCpf(identity.cpf) : null;
    const submittedCpf =
      existing?.cpf && isValidCpf(existing.cpf) ? normalizeCpf(existing.cpf) : null;
    const cpf = submittedCpf ?? diditCpf;

    if (!cpf || !isValidCpf(cpf)) {
      data.status = "rejected";
      data.rejectionReason =
        "Informe um CPF válido antes de iniciar a verificação de identidade.";
      data.reviewedAt = now;
      data.diditVerifiedAt = null;
      data.cpfVerificationProvider = "didit";
      data.cpfVerificationStatus = "cpf_not_found";
      data.cpfVerificationMessage =
        "Verificação Didit aprovada, mas sem CPF válido informado na plataforma.";
      data.cpfVerifiedAt = null;
      if (identity.legalName) data.legalName = identity.legalName;
      if (identity.birthDate) data.birthDate = new Date(`${identity.birthDate}T12:00:00.000Z`);
      if (identity.documentType) data.documentType = identity.documentType;
      if (!existing?.submittedAt) data.submittedAt = now;
    } else if (diditCpf && submittedCpf && diditCpf !== submittedCpf) {
      data.status = "rejected";
      data.rejectionReason =
        "O CPF informado não confere com o CPF retornado pela verificação Didit.";
      data.reviewedAt = now;
      data.diditVerifiedAt = null;
      data.cpfVerificationProvider = "didit";
      data.cpfVerificationStatus = "mismatch";
      data.cpfVerificationMessage =
        "Verificação Didit concluída, mas o CPF retornado não confere com o CPF informado.";
      data.cpfVerifiedAt = null;
      if (identity.legalName) data.legalName = identity.legalName;
      data.cpf = cpf;
      if (identity.birthDate) data.birthDate = new Date(`${identity.birthDate}T12:00:00.000Z`);
      if (identity.documentType) data.documentType = identity.documentType;
      if (!existing?.submittedAt) data.submittedAt = now;
    } else if (await isCpfLinkedToAnotherAccount(cpf, creatorId)) {
      data.status = "rejected";
      data.rejectionReason = DUPLICATE_CPF_ERROR;
      data.reviewedAt = now;
      data.diditVerifiedAt = null;
      data.cpfVerificationProvider = "didit";
      data.cpfVerificationStatus = "mismatch";
      data.cpfVerificationMessage =
        "Verificação Didit concluída, mas o CPF já está em uso em outra conta.";
      data.cpfVerifiedAt = null;
      if (identity.legalName) data.legalName = identity.legalName;
      if (cpf) data.cpf = cpf;
      if (identity.birthDate) data.birthDate = new Date(`${identity.birthDate}T12:00:00.000Z`);
      if (identity.documentType) data.documentType = identity.documentType;
      if (!existing?.submittedAt) data.submittedAt = now;
    } else {
      const canTrustDiditCpf = Boolean(diditCpf && diditCpf === cpf);
      const cpfVerification =
        canTrustDiditCpf || !identity.legalName || !identity.birthDate
          ? null
          : await verifyCpfIdentity({
              cpf,
              legalName: identity.legalName,
              birthDate: identity.birthDate,
            });
      const cpfMatched =
        canTrustDiditCpf || cpfVerification?.status === "matched";

      if (!cpfMatched) {
        data.status = "rejected";
        data.rejectionReason =
          cpfVerification?.message ??
          "Não foi possível confirmar que o CPF informado pertence ao documento enviado.";
        data.reviewedAt = now;
        data.diditVerifiedAt = null;
        data.cpfVerificationProvider = cpfVerification?.provider ?? "didit";
        data.cpfVerificationStatus = cpfVerification?.status ?? "mismatch";
        data.cpfVerificationMessage =
          cpfVerification?.message ??
          "CPF informado não foi confirmado contra os dados do documento.";
        data.cpfVerifiedAt = null;
        if (identity.legalName) data.legalName = identity.legalName;
        data.cpf = cpf;
        if (identity.birthDate) data.birthDate = new Date(`${identity.birthDate}T12:00:00.000Z`);
        if (identity.documentType) data.documentType = identity.documentType;
        if (!existing?.submittedAt) data.submittedAt = now;
      } else {
        data.diditVerifiedAt = now;
        data.reviewedAt = now;
        data.rejectionReason = null;
        data.cpfVerificationProvider = cpfVerification?.provider ?? "didit";
        data.cpfVerificationStatus = cpfVerification?.status ?? "matched";
        data.cpfVerificationMessage =
          cpfVerification?.message ??
          "CPF retornado pela Didit confere com o CPF informado.";
        data.cpfVerifiedAt = now;
        if (identity.legalName) data.legalName = identity.legalName;
        data.cpf = cpf;
        if (identity.birthDate) data.birthDate = new Date(`${identity.birthDate}T12:00:00.000Z`);
        if (identity.documentType) data.documentType = identity.documentType;
        if (!existing?.submittedAt) data.submittedAt = now;
      }
    }
  } else if (kycStatus === "rejected") {
    data.rejectionReason = rejectionReasonFromDecision(decision);
    data.reviewedAt = now;
    data.diditVerifiedAt = null;
    if (!existing?.submittedAt) data.submittedAt = now;
  } else if (kycStatus === "pending") {
    data.rejectionReason = null;
    if (!existing?.submittedAt) data.submittedAt = now;
  } else {
    data.rejectionReason = null;
    data.diditVerifiedAt = null;
  }

  await db.kycVerification.upsert({
    where: { creatorId },
    create: {
      creatorId,
      ...data,
    },
    update: data,
  });

  return getKycProfile(creatorId);
}
