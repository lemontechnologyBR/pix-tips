import { getPrisma } from "@/lib/db";
import {
  computeWooviWithdrawFees,
  isValidPixKey,
  maskPixKey,
  MIN_WITHDRAW_AMOUNT,
} from "@/lib/finance";
import { isKycApproved, normalizeCpf } from "@/lib/kyc";
import {
  createWooviSubaccount,
  creditWooviSubaccount,
  debitWooviSubaccount,
  getWooviSubaccount,
  isWooviConfigured as isWooviEnvConfigured,
  isWooviSplitConfigured,
  WOOVI_SPLIT_MAIN_RESERVE_CENTS,
  withdrawWooviSubaccount,
  WooviApiError,
} from "@/lib/payments/woovi";
import { getKycProfile } from "@/lib/repositories/kyc-repository";
import type { CreatorWooviPixKeyInfo, KycStatus, PixKeyType } from "@/types";

export const MAX_WOOVI_PIX_KEYS = 5;

export class WooviPixKeyLinkedError extends Error {
  constructor() {
    super("Esta chave Pix já está vinculada a outro perfil do pix.tips.");
    this.name = "WooviPixKeyLinkedError";
  }
}

export class WooviPixKeyLimitError extends Error {
  constructor() {
    super(`Você pode cadastrar no máximo ${MAX_WOOVI_PIX_KEYS} chaves Pix.`);
    this.name = "WooviPixKeyLimitError";
  }
}

export interface CreatorWooviSubaccount {
  creatorId: string;
  pixKey: string;
  pixKeyType: PixKeyType | null;
  subaccountName: string | null;
  keyId?: string;
}

function subaccountNameForCreator(creatorId: string, username: string): string {
  const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32);
  return `pixtips_${safeUsername}_${creatorId.slice(-8)}`;
}

function subaccountNameForPixKey(
  creatorId: string,
  username: string,
  pixKey: string,
): string {
  const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 24);
  const keySuffix = pixKey.replace(/\W/g, "").slice(-8) || creatorId.slice(-6);
  return `pixtips_${safeUsername}_${keySuffix}`.slice(0, 64);
}

function isInternalSubaccountName(name: string): boolean {
  return name.startsWith("pixtips_");
}

async function requireVerifiedCreatorForPix(creatorId: string) {
  const row = await getPrisma().kycVerification.findUnique({
    where: { creatorId },
    select: { status: true, legalName: true, cpf: true },
  });

  if (
    !row ||
    !isKycApproved(row.status as KycStatus) ||
    !row.legalName?.trim() ||
    !row.cpf?.trim()
  ) {
    throw new Error(
      "Complete a verificação de identidade antes de cadastrar sua chave Pix.",
    );
  }

  return { legalName: row.legalName.trim(), cpf: row.cpf.trim() };
}

function hasWooviPixKeyModel(db: ReturnType<typeof getPrisma>): boolean {
  return typeof (db as { creatorWooviPixKey?: { count?: unknown } }).creatorWooviPixKey
    ?.count === "function";
}

async function migrateLegacyPixKey(creatorId: string): Promise<void> {
  const db = getPrisma();
  if (!hasWooviPixKeyModel(db)) return;

  const count = await db.creatorWooviPixKey.count({ where: { creatorId } });
  if (count > 0) return;

  const creator = await db.creator.findUnique({
    where: { id: creatorId },
    select: {
      username: true,
      wooviPixKey: true,
      wooviPixKeyType: true,
      wooviSubaccountName: true,
    },
  });
  if (!creator?.wooviPixKey) return;

  await db.creatorWooviPixKey.create({
    data: {
      creatorId,
      pixKey: creator.wooviPixKey,
      pixKeyType: creator.wooviPixKeyType ?? "email",
      subaccountName:
        creator.wooviSubaccountName ??
        subaccountNameForCreator(creatorId, creator.username),
      isPrimary: true,
    },
  });
}

async function syncPrimaryToCreator(creatorId: string): Promise<void> {
  const db = getPrisma();
  const primary =
    (await db.creatorWooviPixKey.findFirst({
      where: { creatorId, isPrimary: true },
    })) ??
    (await db.creatorWooviPixKey.findFirst({
      where: { creatorId },
      orderBy: { createdAt: "asc" },
    }));

  await db.creator.update({
    where: { id: creatorId },
    data: primary
      ? {
          wooviPixKey: primary.pixKey,
          wooviPixKeyType: primary.pixKeyType,
          wooviSubaccountName: primary.subaccountName,
        }
      : {
          wooviPixKey: null,
          wooviPixKeyType: null,
          wooviSubaccountName: null,
        },
  });
}

async function assertBasicPixKeyInput(
  creatorId: string,
  pixKey: string,
  pixKeyType: PixKeyType,
): Promise<void> {
  const identity = await requireVerifiedCreatorForPix(creatorId);

  if (!isValidPixKey(pixKey, pixKeyType)) {
    throw new Error("Chave Pix inválida para o tipo selecionado");
  }

  if (pixKeyType === "cpf" && normalizeCpf(pixKey) !== normalizeCpf(identity.cpf)) {
    throw new Error("Use o CPF verificado na sua identidade como chave Pix.");
  }

  const db = getPrisma();
  if (hasWooviPixKeyModel(db)) {
    const duplicate = await db.creatorWooviPixKey.findFirst({
      where: {
        pixKey,
        NOT: { creatorId },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new WooviPixKeyLinkedError();
    }

    const ownDuplicate = await db.creatorWooviPixKey.findFirst({
      where: { creatorId, pixKey },
      select: { id: true },
    });
    if (ownDuplicate) {
      throw new Error("Esta chave Pix já está cadastrada na sua conta.");
    }
  } else {
    const duplicate = await db.creator.findFirst({
      where: {
        wooviPixKey: pixKey,
        NOT: { id: creatorId },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new WooviPixKeyLinkedError();
    }
  }
}

async function resolveKeyLabel(
  creatorId: string,
  pixKey: string,
  remoteName: string | null | undefined,
): Promise<string | null> {
  if (remoteName && !isInternalSubaccountName(remoteName)) {
    return remoteName;
  }
  const kyc = await getKycProfile(creatorId);
  return kyc.legalName || null;
}

async function legacySubaccountFromCreator(
  creatorId: string,
): Promise<CreatorWooviSubaccount | null> {
  const creator = await getPrisma().creator.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      wooviPixKey: true,
      wooviPixKeyType: true,
      wooviSubaccountName: true,
    },
  });
  if (!creator?.wooviPixKey) return null;
  return {
    creatorId: creator.id,
    pixKey: creator.wooviPixKey,
    pixKeyType: (creator.wooviPixKeyType as PixKeyType | null) ?? null,
    subaccountName: creator.wooviSubaccountName,
  };
}

async function legacyPixKeysFromCreator(
  creatorId: string,
): Promise<CreatorWooviPixKeyInfo[]> {
  const creator = await getPrisma().creator.findUnique({
    where: { id: creatorId },
    select: { wooviPixKey: true, wooviPixKeyType: true, createdAt: true },
  });
  if (!creator?.wooviPixKey) return [];

  let balance = 0;
  let withdrawBlocked = false;
  let wooviSubaccountLabel: string | null = null;
  if (isWooviEnvConfigured()) {
    const remote = await getWooviSubaccount(creator.wooviPixKey);
    if (remote) {
      balance = remote.balance / 100;
      withdrawBlocked = remote.withdrawBlocked;
      wooviSubaccountLabel = await resolveKeyLabel(
        creatorId,
        creator.wooviPixKey,
        remote.name,
      );
    }
  }

  return [
    {
      id: "legacy",
      pixKeyMasked: maskPixKey(creator.wooviPixKey, creator.wooviPixKeyType),
      pixKeyType: (creator.wooviPixKeyType as PixKeyType) ?? "email",
      isPrimary: true,
      balance,
      withdrawBlocked,
      wooviSubaccountLabel,
      createdAt: creator.createdAt.toISOString(),
    },
  ];
}

export async function listCreatorWooviPixKeys(
  creatorId: string,
): Promise<CreatorWooviPixKeyInfo[]> {
  const db = getPrisma();
  if (!hasWooviPixKeyModel(db)) {
    return legacyPixKeysFromCreator(creatorId);
  }

  await migrateLegacyPixKey(creatorId);
  const rows = await db.creatorWooviPixKey.findMany({
    where: { creatorId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  const keys: CreatorWooviPixKeyInfo[] = [];
  for (const row of rows) {
    let balance = 0;
    let withdrawBlocked = false;
    let wooviSubaccountLabel: string | null = null;

    if (isWooviEnvConfigured()) {
      const remote = await getWooviSubaccount(row.pixKey);
      if (remote) {
        balance = remote.balance / 100;
        withdrawBlocked = remote.withdrawBlocked;
        wooviSubaccountLabel = await resolveKeyLabel(
          creatorId,
          row.pixKey,
          remote.name,
        );
      }
    }

    keys.push({
      id: row.id,
      pixKeyMasked: maskPixKey(row.pixKey, row.pixKeyType),
      pixKeyType: row.pixKeyType as PixKeyType,
      isPrimary: row.isPrimary,
      balance,
      withdrawBlocked,
      wooviSubaccountLabel,
      createdAt: row.createdAt.toISOString(),
    });
  }

  return keys;
}

export async function getCreatorWooviSubaccount(
  creatorId: string,
): Promise<CreatorWooviSubaccount | null> {
  const db = getPrisma();
  if (!hasWooviPixKeyModel(db)) {
    return legacySubaccountFromCreator(creatorId);
  }

  await migrateLegacyPixKey(creatorId);
  const row =
    (await db.creatorWooviPixKey.findFirst({
      where: { creatorId, isPrimary: true },
    })) ??
    (await db.creatorWooviPixKey.findFirst({
      where: { creatorId },
      orderBy: { createdAt: "asc" },
    }));

  if (!row) return null;

  return {
    creatorId,
    pixKey: row.pixKey,
    pixKeyType: row.pixKeyType as PixKeyType,
    subaccountName: row.subaccountName,
    keyId: row.id,
  };
}

async function getCreatorWooviPixKeyRecord(
  creatorId: string,
  keyId?: string,
) {
  await migrateLegacyPixKey(creatorId);
  const db = getPrisma();

  if (keyId) {
    return db.creatorWooviPixKey.findFirst({
      where: { id: keyId, creatorId },
    });
  }

  return (
    (await db.creatorWooviPixKey.findFirst({
      where: { creatorId, isPrimary: true },
    })) ??
    (await db.creatorWooviPixKey.findFirst({
      where: { creatorId },
      orderBy: { createdAt: "asc" },
    }))
  );
}

export async function addCreatorWooviPixKey(
  creatorId: string,
  input: { pixKey: string; pixKeyType: PixKeyType },
): Promise<void> {
  const pixKey = input.pixKey.trim();
  await assertBasicPixKeyInput(creatorId, pixKey, input.pixKeyType);

  const db = getPrisma();
  if (!hasWooviPixKeyModel(db)) {
    throw new Error(
      "Banco desatualizado. Execute npx prisma generate e reinicie o servidor.",
    );
  }

  await migrateLegacyPixKey(creatorId);

  const count = await db.creatorWooviPixKey.count({ where: { creatorId } });
  if (count >= MAX_WOOVI_PIX_KEYS) {
    throw new WooviPixKeyLimitError();
  }

  const creator = await db.creator.findUnique({
    where: { id: creatorId },
    select: { username: true },
  });
  if (!creator) {
    throw new Error("Criador não encontrado");
  }

  const subaccountName = subaccountNameForPixKey(
    creatorId,
    creator.username,
    pixKey,
  );

  if (isWooviEnvConfigured()) {
    await createWooviSubaccount({ name: subaccountName, pixKey });
  }

  const isPrimary = count === 0;

  await db.creatorWooviPixKey.create({
    data: {
      creatorId,
      pixKey,
      pixKeyType: input.pixKeyType,
      subaccountName,
      isPrimary,
    },
  });

  await syncPrimaryToCreator(creatorId);
}

export async function removeCreatorWooviPixKey(
  creatorId: string,
  keyId: string,
): Promise<void> {
  const db = getPrisma();
  await migrateLegacyPixKey(creatorId);

  const row = await db.creatorWooviPixKey.findFirst({
    where: { id: keyId, creatorId },
  });
  if (!row) {
    throw new Error("Chave Pix não encontrada.");
  }

  if (isWooviEnvConfigured()) {
    const remote = await getWooviSubaccount(row.pixKey);
    if (remote && remote.balance >= 1) {
      throw new Error(
        "Saque o saldo desta chave antes de removê-la.",
      );
    }
  }

  await db.creatorWooviPixKey.delete({ where: { id: row.id } });

  if (row.isPrimary) {
    const next = await db.creatorWooviPixKey.findFirst({
      where: { creatorId },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await db.creatorWooviPixKey.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

  await syncPrimaryToCreator(creatorId);
}

export async function setPrimaryCreatorWooviPixKey(
  creatorId: string,
  keyId: string,
): Promise<void> {
  const db = getPrisma();
  await migrateLegacyPixKey(creatorId);

  const row = await db.creatorWooviPixKey.findFirst({
    where: { id: keyId, creatorId },
  });
  if (!row) {
    throw new Error("Chave Pix não encontrada.");
  }

  await db.$transaction([
    db.creatorWooviPixKey.updateMany({
      where: { creatorId },
      data: { isPrimary: false },
    }),
    db.creatorWooviPixKey.update({
      where: { id: keyId },
      data: { isPrimary: true },
    }),
  ]);

  await syncPrimaryToCreator(creatorId);
}

export async function getWooviConnectionStatus(creatorId: string) {
  const pixKeys = await listCreatorWooviPixKeys(creatorId);
  const primary = pixKeys.find((k) => k.isPrimary) ?? pixKeys[0] ?? null;

  const subaccountBalance = pixKeys.reduce((sum, k) => sum + k.balance, 0);
  const withdrawBlocked =
    pixKeys.length > 0 && pixKeys.every((k) => k.withdrawBlocked);

  const primaryRow = primary
    ? await getPrisma().creatorWooviPixKey.findFirst({
        where: { id: primary.id, creatorId },
        select: { subaccountName: true },
      })
    : null;

  return {
    connected: pixKeys.length > 0,
    maxPixKeys: MAX_WOOVI_PIX_KEYS,
    pixKeys,
    pixKeyMasked: primary?.pixKeyMasked ?? null,
    pixKeyType: primary?.pixKeyType ?? null,
    subaccountName: primaryRow?.subaccountName ?? null,
    wooviSubaccountLabel: primary?.wooviSubaccountLabel ?? null,
    balanceCents: Math.round(subaccountBalance * 100),
    subaccountBalance,
    withdrawBlocked,
  };
}

export async function connectWooviPixKey(
  creatorId: string,
  input: { pixKey: string; pixKeyType: PixKeyType },
): Promise<void> {
  return addCreatorWooviPixKey(creatorId, input);
}

/** Remove todas as chaves (legado). Prefira removeCreatorWooviPixKey. */
export async function disconnectWooviPixKey(creatorId: string): Promise<void> {
  const db = getPrisma();
  await migrateLegacyPixKey(creatorId);
  await db.creatorWooviPixKey.deleteMany({ where: { creatorId } });
  await syncPrimaryToCreator(creatorId);
}

export async function ensureCreatorWooviSubaccounts(
  creatorId?: string,
): Promise<{ ensured: number; errors: string[] }> {
  const db = getPrisma();

  if (creatorId) {
    await migrateLegacyPixKey(creatorId);
  } else {
    const creators = await db.creator.findMany({ select: { id: true } });
    for (const c of creators) {
      await migrateLegacyPixKey(c.id);
    }
  }

  const rows = await db.creatorWooviPixKey.findMany({
    where: creatorId ? { creatorId } : undefined,
    include: { creator: { select: { username: true } } },
  });

  let ensured = 0;
  const errors: string[] = [];

  if (!isWooviEnvConfigured()) {
    return { ensured: 0, errors: ["Woovi não configurado."] };
  }

  for (const row of rows) {
    try {
      const existing = await getWooviSubaccount(row.pixKey);
      if (existing) {
        ensured += 1;
        continue;
      }
      const name =
        row.subaccountName ||
        subaccountNameForPixKey(row.creatorId, row.creator.username, row.pixKey);
      await createWooviSubaccount({ name, pixKey: row.pixKey });
      ensured += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "erro";
      errors.push(`${row.creator.username}: ${message}`);
    }
  }

  return { ensured, errors };
}

export async function isCreatorWooviConnected(creatorId: string): Promise<boolean> {
  await migrateLegacyPixKey(creatorId);
  const count = await getPrisma().creatorWooviPixKey.count({
    where: { creatorId },
  });
  return count > 0;
}

export async function creditWooviSplitReserveAfterPayment(
  creatorId: string,
  transaction: {
    id: string;
    splitPayment?: boolean;
    applicationFee?: number | null;
  },
): Promise<void> {
  if (!transaction.splitPayment || transaction.applicationFee != null) return;

  const subaccount = await getCreatorWooviSubaccount(creatorId);
  if (!subaccount?.pixKey || !isWooviEnvConfigured()) return;

  const db = getPrisma();
  const marked = await db.transaction.updateMany({
    where: {
      id: transaction.id,
      splitPayment: true,
      applicationFee: null,
    },
    data: { applicationFee: 0 },
  });
  if (marked.count === 0) return;

  try {
    await creditWooviSubaccount(
      subaccount.pixKey,
      WOOVI_SPLIT_MAIN_RESERVE_CENTS,
      "Complemento split pix.tips",
    );
  } catch (error) {
    await db.transaction.update({
      where: { id: transaction.id },
      data: { applicationFee: null },
    });
    console.error("[woovi] credit split reserve:", error);
  }
}

export async function reconcileWooviSubaccountBeforeWithdraw(
  _creatorId: string,
  _pixKey: string,
): Promise<void> {}

export async function withdrawCreatorWooviBalance(
  creatorId: string,
  amountReais?: number,
  keyId?: string,
) {
  const row = await getCreatorWooviPixKeyRecord(creatorId, keyId);
  if (!row) {
    throw new Error("Chave Pix não configurada.");
  }

  const sub = await getWooviSubaccount(row.pixKey);
  if (!sub || sub.balance < 1) {
    throw new Error("Sem saldo disponível para saque nesta chave.");
  }

  const requestedNetReais =
    amountReais != null ? amountReais : Math.round(sub.balance) / 100;

  if (amountReais != null && requestedNetReais < MIN_WITHDRAW_AMOUNT) {
    throw new Error(
      `Valor mínimo para saque: R$ ${MIN_WITHDRAW_AMOUNT.toFixed(2).replace(".", ",")}`,
    );
  }

  const fees = computeWooviWithdrawFees(requestedNetReais);
  if (fees.netAmount < MIN_WITHDRAW_AMOUNT) {
    throw new Error(
      `Valor mínimo para saque: R$ ${MIN_WITHDRAW_AMOUNT.toFixed(2).replace(".", ",")}`,
    );
  }

  const grossCents = Math.round(fees.grossAmount * 100);
  const feeCents = Math.round(fees.totalFees * 100);
  const netCents = Math.round(fees.netAmount * 100);

  if (grossCents > sub.balance) {
    throw new Error(
      `Saldo insuficiente. Para receber R$ ${fees.netAmount
        .toFixed(2)
        .replace(".", ",")}, é necessário ter R$ ${fees.grossAmount
        .toFixed(2)
        .replace(".", ",")} incluindo a taxa.`,
    );
  }

  if (feeCents > 0) {
    await debitWooviSubaccount(
      row.pixKey,
      feeCents,
      "Taxa de saque pix.tips",
    );
  }

  let result: Awaited<ReturnType<typeof withdrawWooviSubaccount>>;
  try {
    result = await withdrawWooviSubaccount(row.pixKey, netCents);
  } catch (error) {
    if (feeCents > 0) {
      try {
        await creditWooviSubaccount(
          row.pixKey,
          feeCents,
          "Estorno taxa saque pix.tips",
        );
      } catch (refundError) {
        console.error("[woovi] refund withdraw fee failed:", refundError);
      }
    }
    throw error;
  }

  return {
    ...result,
    grossCents,
    feeCents,
    netCents: result.value,
    fees,
    pixKey: row.pixKey,
    pixKeyType: row.pixKeyType as PixKeyType,
    keyId: row.id,
  };
}

export {
  isWooviEnvConfigured as isWooviConfigured,
  isWooviSplitConfigured,
  WooviApiError,
};
