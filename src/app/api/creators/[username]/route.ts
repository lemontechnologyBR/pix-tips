import { NextResponse } from "next/server";
import { getCreatorByUsername, getRecentDonations } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
  }

  const publicCreator = {
    id: creator.id,
    username: creator.username,
    displayName: creator.displayName,
    avatar: creator.avatar,
    bio: creator.bio,
    themeColor: creator.themeColor,
    goal: creator.goal,
    raised: creator.raised,
    tipPageSettings: creator.tipPageSettings,
    paymentMethods: creator.paymentMethods,
    plan: creator.plan,
  };

  const recentDonations = (await getRecentDonations(creator.id)).map((t) => ({
    id: t.id,
    donorName: t.anonymous ? null : t.donorName,
    amount: t.amount,
    message: t.message,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ creator: publicCreator, recentDonations });
}
