import { ProfileContent } from "@/components/dashboard/ProfileContent";
import { getCurrentCreator } from "@/lib/auth";
import { getFinanceOverview } from "@/lib/repositories/finance-repository";
import { getUserProfile } from "@/lib/store";

export default async function ProfilePage() {
  const creator = await getCurrentCreator();
  const [profile, financeOverview] = await Promise.all([
    getUserProfile(creator.id),
    getFinanceOverview(creator.id),
  ]);

  return <ProfileContent profile={profile} financeOverview={financeOverview} />;
}
