import { CreatorHeader } from "@/components/tip/CreatorHeader";
import { PublicTipPageLayout } from "@/components/tip/PublicTipPageLayout";
import { ThanksContent } from "@/components/tip/ThanksContent";
import { TipPageFooter } from "@/components/tip/TipPageFooter";
import { CreatorNotFound } from "@/components/tip/CreatorNotFound";
import { getCreatorByUsername } from "@/lib/store";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ amount?: string; name?: string }>;
}

export default async function ThanksPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const { amount, name } = await searchParams;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    return <CreatorNotFound />;
  }

  const parsedAmount = amount ? parseFloat(amount) : undefined;

  return (
    <PublicTipPageLayout creator={creator}>
      <CreatorHeader creator={creator} />
      <ThanksContent
        creator={creator}
        amount={parsedAmount}
        donorName={name}
      />
      <TipPageFooter />
    </PublicTipPageLayout>
  );
}
