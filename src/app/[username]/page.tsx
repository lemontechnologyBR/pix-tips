import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { TipPageRenderer } from "@/components/tip/TipPageRenderer";
import { CreatorNotFound } from "@/components/tip/CreatorNotFound";
import { getSessionFromCookies } from "@/lib/auth/session";
import { listCreatorMissions } from "@/lib/fan-missions";
import { listCreatorSubPlans } from "@/lib/fan-subscriptions";
import { getCreatorByUsername, getRecentDonations } from "@/lib/store";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicTipPage({ params }: PageProps) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    return <CreatorNotFound />;
  }

  const session = await getSessionFromCookies();
  const fanKey = session?.userId ? `user:${session.userId}` : null;

  const maxVisible = creator.tipPageSettings.maxSupportersVisible ?? 10;
  const [recentDonationsRaw, subPlans, missions] = await Promise.all([
    getRecentDonations(creator.id, maxVisible),
    listCreatorSubPlans(creator.id, { activeOnly: true }),
    listCreatorMissions(creator.id, { activeOnly: true, fanKey }),
  ]);
  const recentDonations = recentDonationsRaw.map((t) => ({
    id: t.id,
    donorName: t.anonymous ? null : t.donorName,
    amount: t.amount,
    message: t.message,
    createdAt: t.createdAt,
  }));

  return (
    <>
      <AnalyticsBeacon
        type="tip_page_view"
        creatorId={creator.id}
        path={`/${creator.username}`}
      />
      <TipPageRenderer
        creator={creator}
        recentDonations={recentDonations}
        subPlans={subPlans}
        missions={missions}
      />
    </>
  );
}
