import { tipPagePath } from "@/lib/brand";
import { EarningsChart } from "@/components/dashboard/EarningsChart";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { OverviewHero } from "@/components/dashboard/OverviewHero";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentDonations } from "@/components/dashboard/RecentDonations";
import { getCurrentCreator } from "@/lib/auth";
import {
  getDashboardOverview,
  getRecentDonations,
} from "@/lib/store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visão Geral",
};

export default async function OverviewPage() {
  const creator = await getCurrentCreator();
  const overview = await getDashboardOverview(creator.id);
  const recent = await getRecentDonations(creator.id, 5);
  const tipUrl = tipPagePath(creator.username);

  return (
    <div className="w-full space-y-6 pb-8">
      <OverviewHero
        creator={{
          displayName: creator.displayName,
          username: creator.username,
          plan: creator.plan,
          raised: creator.raised,
          goal: creator.goal,
          themeColor: creator.themeColor,
        }}
        overview={{
          totalMonth: overview.totalMonth,
          supportersMonth: overview.supportersMonth,
        }}
        tipPageUrl={tipUrl}
      />

      <MetricsCards
        overview={overview}
        goal={creator.goal}
        raised={creator.raised}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <EarningsChart data={overview.chartData} />
        <RecentDonations donations={recent} />
      </div>

      <QuickActions tipPageUrl={tipUrl} username={creator.username} />
    </div>
  );
}
