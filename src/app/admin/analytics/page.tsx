import { AdminAnalyticsPanel } from "@/components/admin/AdminAnalyticsPanel";
import { getAdminTrafficAnalytics } from "@/lib/repositories/admin-analytics-repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const initial = await getAdminTrafficAnalytics(30);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Analytics de acesso</h2>
        <p className="text-sm text-zinc-400">
          De onde vêm as visitas: Google Ads, redes sociais, referrers e campanhas
          UTM.
        </p>
      </div>
      <AdminAnalyticsPanel initial={structuredClone(initial)} />
    </div>
  );
}
