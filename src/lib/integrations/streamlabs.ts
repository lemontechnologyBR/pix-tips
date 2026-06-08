import { getOAuthAccountForCreator } from "@/lib/auth/oauth";
import type { Transaction } from "@/types";

export async function sendStreamlabsDonation(
  creatorId: string,
  transaction: Transaction,
): Promise<void> {
  const account = await getOAuthAccountForCreator(creatorId, "streamlabs");
  if (!account) return;

  const donorName = transaction.anonymous ? "Anônimo" : transaction.donorName;

  const res = await fetch("https://streamlabs.com/api/v2.0/donations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: donorName,
      message: transaction.message ?? "",
      identifier: `${transaction.id}@pix.tips`,
      amount: transaction.amount,
      currency: "BRL",
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Streamlabs donation failed (${res.status}): ${detail}`);
  }
}
