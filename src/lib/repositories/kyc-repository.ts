import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import {
  canSubmitKyc,
  isKycApproved,
  isValidBirthDate,
  isValidCpf,
  isValidDocumentType,
  maskCpf,
  normalizeCpf,
} from "@/lib/kyc";
import {
  isCpfVerificationBlocking,
  type CpfVerificationResult,
  verifyCpfIdentity,
} from "@/lib/kyc/cpf-provider";
import type { CpfVerificationStatus, KycDocumentType, KycProfile, KycStatus } from "@/types";

export interface AdminKycRow {
  creatorId: string;
  username: string;
  displayName: string;
  email: string;
  status: KycStatus;
  legalName: string | null;
  cpfMasked: string | null;
  birthDate: string | null;
  documentType: KycDocumentType | null;
  submittedAt: string | null;
  rejectionReason: string | null;
  cpfVerificationStatus: CpfVerificationStatus | null;
  cpfVerificationMessage: string | null;
  cpfVerificationProvider: string | null;
}

function mapKycProfile(row: {
  status: string;
  legalName: string | null;
  cpf: string | null;
  birthDate: Date | null;
  documentType: string | null;
  rejectionReason: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  cpfVerificationStatus: string | null;
  cpfVerificationMessage: string | null;
  cpfVerificationProvider: string | null;
} | null): KycProfile {
  const status = (row?.status ?? "none") as KycStatus;

  return {
    status,
    legalName: row?.legalName ?? null,
    cpfMasked: row?.cpf ? maskCpf(row.cpf) : null,
    birthDate: row?.birthDate ? row.birthDate.toISOString().slice(0, 10) : null,
    documentType: (row?.documentType as KycDocumentType | null) ?? null,
    rejectionReason: row?.rejectionReason ?? null,
    submittedAt: row?.submittedAt?.toISOString() ?? null,
    reviewedAt: row?.reviewedAt?.toISOString() ?? null,
    cpfVerificationStatus: (row?.cpfVerificationStatus as CpfVerificationStatus | null) ?? null,
    cpfVerificationMessage: row?.cpfVerificationMessage ?? null,
    cpfVerificationProvider: row?.cpfVerificationProvider ?? null,
    canSubmit: canSubmitKyc(status),
    canWithdraw: isKycApproved(status),
  };
}

function mapAdminRow(row: {
  creatorId: string;
  status: string;
  legalName: string | null;
  cpf: string | null;
  birthDate: Date | null;
  documentType: string | null;
  submittedAt: Date | null;
  rejectionReason: string | null;
  cpfVerificationStatus: string | null;
  cpfVerificationMessage: string | null;
  cpfVerificationProvider: string | null;
  creator: {
    username: string;
    displayName: string;
    user: { email: string };
  };
}): AdminKycRow {
  return {
    creatorId: row.creatorId,
    username: row.creator.username,
    displayName: row.creator.displayName,
    email: row.creator.user.email,
    status: row.status as KycStatus,
    legalName: row.legalName,
    cpfMasked: row.cpf ? maskCpf(row.cpf) : null,
    birthDate: row.birthDate ? row.birthDate.toISOString().slice(0, 10) : null,
    documentType: (row.documentType as KycDocumentType | null) ?? null,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    rejectionReason: row.rejectionReason,
    cpfVerificationStatus: (row.cpfVerificationStatus as CpfVerificationStatus | null) ?? null,
    cpfVerificationMessage: row.cpfVerificationMessage,
    cpfVerificationProvider: row.cpfVerificationProvider,
  };
}

export async function getKycProfile(creatorId: string): Promise<KycProfile> {
  const row = await prisma.kycVerification.findUnique({ where: { creatorId } });
  return mapKycProfile(row);
}

export async function hasExclusiveApprovedKyc(creatorId: string): Promise<boolean> {
  const row = await prisma.kycVerification.findUnique({
    where: { creatorId },
    select: { status: true, cpf: true },
  });

  if (row?.status !== "approved") {
    return false;
  }

  const cpf = row.cpf ? normalizeCpf(row.cpf) : "";
  if (!isValidCpf(cpf)) {
    return false;
  }

  return !(await isCpfLinkedToAnotherAccount(cpf, creatorId));
}

export interface ValidateKycFieldsInput {
  creatorId: string;
  legalName: string;
  cpf: string;
  birthDate: string;
  documentType: KycDocumentType;
}

export const DUPLICATE_CPF_ERROR = "Este CPF já está vinculado a outra conta.";

export async function isCpfLinkedToAnotherAccount(
  cpf: string,
  excludeCreatorId: string,
): Promise<boolean> {
  const normalized = normalizeCpf(cpf);
  if (!isValidCpf(normalized)) {
    return false;
  }

  const duplicateCpf = await prisma.kycVerification.findFirst({
    where: {
      cpf: normalized,
      creatorId: { not: excludeCreatorId },
      status: { in: ["pending", "approved"] },
    },
    select: { id: true },
  });

  return Boolean(duplicateCpf);
}

export async function validateKycFields(
  input: ValidateKycFieldsInput,
): Promise<{ error?: string; cpfVerification?: CpfVerificationResult }> {
  const local = await validateKycLocalFields(input);
  if (local.error) return local;

  const cpfVerification = await verifyCpfIdentity({
    cpf: normalizeCpf(input.cpf),
    legalName: input.legalName.trim(),
    birthDate: input.birthDate,
  });

  if (isCpfVerificationBlocking(cpfVerification)) {
    return {
      error: cpfVerification.message ?? "Dados do CPF não conferem.",
      cpfVerification,
    };
  }

  return { cpfVerification };
}

async function validateKycLocalFields(
  input: ValidateKycFieldsInput,
): Promise<{ error?: string }> {
  const legalName = input.legalName.trim();
  const cpf = normalizeCpf(input.cpf);

  if (legalName.length < 3) {
    return { error: "Informe seu nome completo como no documento." };
  }

  if (!isValidCpf(cpf)) {
    return { error: "CPF inválido." };
  }

  if (!isValidBirthDate(input.birthDate)) {
    return { error: "Data de nascimento inválida. Você precisa ter 18 anos ou mais." };
  }

  if (!isValidDocumentType(input.documentType)) {
    return { error: "Tipo de documento inválido." };
  }

  const duplicateCpf = await isCpfLinkedToAnotherAccount(cpf, input.creatorId);

  if (duplicateCpf) {
    return { error: DUPLICATE_CPF_ERROR };
  }

  return {};
}

export async function submitKyc(
  creatorId: string,
  input: {
    legalName: string;
    cpf: string;
    birthDate: string;
    documentType: KycDocumentType;
    documentFrontKey: string;
    documentBackKey: string;
    selfieKey: string;
  },
  options?: { cpfVerification?: CpfVerificationResult },
): Promise<{ error?: string; profile?: KycProfile }> {
  const existing = await prisma.kycVerification.findUnique({ where: { creatorId } });
  const status = (existing?.status ?? "none") as KycStatus;

  if (!canSubmitKyc(status)) {
    return { error: "Sua verificação já está em análise ou aprovada." };
  }

  const local = await validateKycLocalFields({
    creatorId,
    legalName: input.legalName,
    cpf: input.cpf,
    birthDate: input.birthDate,
    documentType: input.documentType,
  });

  if (local.error) {
    return { error: local.error };
  }

  let cpfVerification = options?.cpfVerification;
  if (!cpfVerification) {
    cpfVerification = await verifyCpfIdentity({
      cpf: normalizeCpf(input.cpf),
      legalName: input.legalName.trim(),
      birthDate: input.birthDate,
    });

    if (isCpfVerificationBlocking(cpfVerification)) {
      return { error: cpfVerification.message ?? "Dados do CPF não conferem." };
    }
  } else if (isCpfVerificationBlocking(cpfVerification)) {
    return { error: cpfVerification.message ?? "Dados do CPF não conferem." };
  }

  const legalName = input.legalName.trim();
  const cpf = normalizeCpf(input.cpf);

  const prefix = `${creatorId}/kyc/`;
  const keys = [input.documentFrontKey, input.documentBackKey, input.selfieKey];
  if (!keys.every((key) => key.startsWith(prefix))) {
    return { error: "Documentos inválidos. Envie novamente." };
  }

  const birthDate = new Date(`${input.birthDate}T12:00:00.000Z`);
  const verifiedAt =
    cpfVerification && cpfVerification.status !== "skipped" ? new Date() : null;

  const row = await prisma.kycVerification.upsert({
    where: { creatorId },
    create: {
      creatorId,
      status: "pending",
      legalName,
      cpf,
      birthDate,
      documentType: input.documentType,
      documentFrontKey: input.documentFrontKey,
      documentBackKey: input.documentBackKey,
      selfieKey: input.selfieKey,
      rejectionReason: null,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedByUserId: null,
      cpfVerificationProvider: cpfVerification?.provider ?? null,
      cpfVerificationStatus: cpfVerification?.status ?? null,
      cpfVerificationMessage: cpfVerification?.message ?? null,
      cpfVerifiedAt: verifiedAt,
    },
    update: {
      status: "pending",
      legalName,
      cpf,
      birthDate,
      documentType: input.documentType,
      documentFrontKey: input.documentFrontKey,
      documentBackKey: input.documentBackKey,
      selfieKey: input.selfieKey,
      rejectionReason: null,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedByUserId: null,
      cpfVerificationProvider: cpfVerification?.provider ?? null,
      cpfVerificationStatus: cpfVerification?.status ?? null,
      cpfVerificationMessage: cpfVerification?.message ?? null,
      cpfVerifiedAt: verifiedAt,
    },
  });

  return { profile: mapKycProfile(row) };
}

export async function listAdminKyc(status?: KycStatus): Promise<AdminKycRow[]> {
  const rows = await prisma.kycVerification.findMany({
    where: status ? { status } : { status: { not: "none" } },
    include: {
      creator: {
        include: {
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return rows.map(mapAdminRow);
}

export async function reviewKyc(
  creatorId: string,
  adminUserId: string,
  decision: "approved" | "rejected",
  rejectionReason?: string,
): Promise<{ error?: string; row?: AdminKycRow }> {
  const existing = await prisma.kycVerification.findUnique({ where: { creatorId } });
  if (!existing || existing.status !== "pending") {
    return { error: "Solicitação não encontrada ou já revisada." };
  }

  if (decision === "rejected" && !rejectionReason?.trim()) {
    return { error: "Informe o motivo da recusa." };
  }

  if (decision === "approved") {
    const cpf = existing.cpf ? normalizeCpf(existing.cpf) : "";
    if (!isValidCpf(cpf)) {
      return { error: "CPF inválido ou ausente nesta solicitação." };
    }
    if (await isCpfLinkedToAnotherAccount(cpf, creatorId)) {
      return { error: DUPLICATE_CPF_ERROR };
    }
  }

  const row = await prisma.kycVerification.update({
    where: { creatorId },
    data: {
      status: decision,
      rejectionReason: decision === "rejected" ? rejectionReason!.trim() : null,
      reviewedAt: new Date(),
      reviewedByUserId: adminUserId,
    },
    include: {
      creator: {
        include: {
          user: { select: { email: true } },
        },
      },
    },
  });

  return { row: mapAdminRow(row) };
}

export async function getKycDocumentKey(
  creatorId: string,
  kind: "front" | "back" | "selfie",
): Promise<string | null> {
  const row = await prisma.kycVerification.findUnique({ where: { creatorId } });
  if (!row) return null;

  if (kind === "front") return row.documentFrontKey;
  if (kind === "back") return row.documentBackKey;
  return row.selfieKey;
}

function isS3Enabled(): boolean {
  return Boolean(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID);
}

export async function readKycDocumentBuffer(key: string): Promise<{
  buffer: Buffer;
  contentType: string;
} | null> {
  const ext = path.extname(key).toLowerCase();
  const contentType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  if (isS3Enabled()) {
    const { S3Client, GetObjectCommand: GetCmd } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: process.env.AWS_REGION ?? "auto",
      endpoint: process.env.AWS_S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
      forcePathStyle: Boolean(process.env.AWS_S3_ENDPOINT),
    });

    const res = await client.send(
      new GetCmd({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      }),
    );

    if (!res.Body) return null;
    const bytes = await res.Body.transformToByteArray();
    return { buffer: Buffer.from(bytes), contentType: res.ContentType ?? contentType };
  }

  const filePath = path.join(process.cwd(), "public", "uploads", key);
  try {
    const buffer = await readFile(filePath);
    return { buffer, contentType };
  } catch {
    return null;
  }
}

export { mapKycProfile };
