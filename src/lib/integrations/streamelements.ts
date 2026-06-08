import { getOAuthAccountForCreator } from "@/lib/auth/oauth";
import type { Transaction } from "@/types";

export async function sendStreamElementsTip(
  creatorId: string,
  transaction: Transaction,
): Promise<void> {
  const account = await getOAuthAccountForCreator(creatorId, "streamelements");
  if (!account) return;

  const donorName = transaction.anonymous ? "Anônimo" : transaction.donorName;

  const res = await fetch(
    `https://api.streamelements.com/kappa/v2/tips/${account.providerAccountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `oAuth ${account.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        user: {
          username: donorName,
          userId: transaction.id,
          email: "no@email.no",
        },
        provider: "pixtips",
        message: transaction.message ?? "",
        amount: transaction.amount,
        currency: "BRL",
        imported: "true",
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`StreamElements tip failed (${res.status}): ${detail}`);
  }
}
