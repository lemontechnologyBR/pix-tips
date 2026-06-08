import { sendStreamElementsTip } from "@/lib/integrations/streamelements";
import { sendStreamlabsDonation } from "@/lib/integrations/streamlabs";
import type { Transaction } from "@/types";

export async function forwardDonationToIntegrations(
  creatorId: string,
  transaction: Transaction,
): Promise<void> {
  await Promise.allSettled([
    sendStreamlabsDonation(creatorId, transaction).catch((err) => {
      console.error("[integrations/streamlabs]", err);
    }),
    sendStreamElementsTip(creatorId, transaction).catch((err) => {
      console.error("[integrations/streamelements]", err);
    }),
  ]);
}
