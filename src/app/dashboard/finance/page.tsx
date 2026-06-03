import { FinanceDashboard } from "@/components/dashboard/FinanceDashboard";
import { getCurrentCreator } from "@/lib/auth";
import { isDiditConfigured } from "@/lib/didit";
import { getFinanceOverview } from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default async function FinancePage() {
  const creator = await getCurrentCreator();
  const overview = await getFinanceOverview(creator.id);

  return (
    <FinanceDashboard
      initialOverview={structuredClone(overview)}
      diditEnabled={isDiditConfigured()}
    />
  );
}
