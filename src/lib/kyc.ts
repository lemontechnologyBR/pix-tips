import type { KycDocumentType, KycStatus } from "@/types";

export const KYC_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const KYC_ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;

export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCpf(value: string): string {
  const digits = normalizeCpf(value);
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function maskCpf(value: string): string {
  const digits = normalizeCpf(value);
  if (digits.length !== 11) return "•••.•••.•••-••";
  return `•••.•••.•••-${digits.slice(-2)}`;
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === Number(cpf[10]);
}

export function isValidBirthDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxAge = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

  return date <= minAge && date >= maxAge;
}

export function isValidDocumentType(value: string): value is KycDocumentType {
  return value === "rg" || value === "cnh";
}

export function isKycApproved(status: KycStatus): boolean {
  return status === "approved";
}

export function canSubmitKyc(status: KycStatus): boolean {
  return status === "none" || status === "rejected";
}

export function kycStatusLabel(status: KycStatus): string {
  switch (status) {
    case "approved":
      return "Verificado";
    case "pending":
      return "Em análise";
    case "rejected":
      return "Recusado";
    default:
      return "Não verificado";
  }
}
