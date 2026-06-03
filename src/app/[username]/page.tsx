import { TipPageRenderer } from "@/components/tip/TipPageRenderer";
import { CreatorNotFound } from "@/components/tip/CreatorNotFound";
import { getCreatorByUsername, getRecentDonations } from "@/lib/store";

export const revalidate = 30;

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicTipPage({ params }: PageProps) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    return <CreatorNotFound />;
  }

  const maxVisible = creator.tipPageSettings.maxSupportersVisible ?? 10;
  const recentDonations = (await getRecentDonations(creator.id, maxVisible)).map((t) => ({
    id: t.id,
    donorName: t.anonymous ? null : t.donorName,
    amount: t.amount,
    message: t.message,
    createdAt: t.createdAt,
  }));

  return <TipPageRenderer creator={creator} recentDonations={recentDonations} />;
}
