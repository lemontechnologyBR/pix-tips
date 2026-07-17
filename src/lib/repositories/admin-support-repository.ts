import { prisma } from "@/lib/db";

export interface SupportCreatorRow {
  id: string;
  username: string;
  displayName: string;
  email: string;
  plan: string;
  isSuspended: boolean;
  kycStatus: string;
  raised: number;
  createdAt: string;
}

export async function listSupportCreators(): Promise<SupportCreatorRow[]> {
  const rows = await prisma.creator.findMany({
    include: {
      user: { select: { email: true } },
      kycVerification: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return rows.map((c) => ({
    id: c.id,
    username: c.username,
    displayName: c.displayName,
    email: c.user.email,
    plan: c.plan,
    isSuspended: c.isSuspended,
    kycStatus: c.kycVerification?.status ?? "none",
    raised: c.raised,
    createdAt: c.createdAt.toISOString(),
  }));
}

export function getChatwootUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CHATWOOT_URL?.trim() ||
    process.env.CHATWOOT_URL?.trim() ||
    "https://chat.pix.tips"
  );
}
