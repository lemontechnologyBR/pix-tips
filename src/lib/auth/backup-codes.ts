import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const BACKUP_CODE_COUNT = 8;
const BACKUP_CODE_LENGTH = 8;
const SALT_ROUNDS = 10;

/** Gera um código alfanumérico aleatório (maiúsculas + dígitos). */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = randomBytes(BACKUP_CODE_LENGTH);
  for (let i = 0; i < BACKUP_CODE_LENGTH; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/** Gera N códigos em texto claro e seus hashes bcrypt. */
export async function generateBackupCodes(): Promise<{
  plainCodes: string[];
  hashedCodes: string[];
}> {
  const plainCodes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    plainCodes.push(generateCode());
  }

  const hashedCodes = await Promise.all(
    plainCodes.map((code) => bcrypt.hash(code, SALT_ROUNDS)),
  );

  return { plainCodes, hashedCodes };
}

/** Verifica se o código informado bate com algum dos hashes guardados.
 *  Retorna os hashes restantes (sem o que foi usado), ou null se inválido. */
export async function consumeBackupCode(
  code: string,
  hashedCodes: string[],
): Promise<string[] | null> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const match = await bcrypt.compare(code.toUpperCase(), hashedCodes[i]);
    if (match) {
      const remaining = [...hashedCodes];
      remaining.splice(i, 1);
      return remaining;
    }
  }
  return null;
}

/** Serializa array de hashes para guardar no banco. */
export function serializeBackupCodes(hashes: string[]): string {
  return JSON.stringify(hashes);
}

/** Deserializa array de hashes do banco. */
export function deserializeBackupCodes(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
