import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { mapDbCreatorToCreator } from "@/lib/auth/creator-mapper";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const DashboardShell = nextDynamic(
  () =>
    import("@/components/dashboard/DashboardShell").then((mod) => mod.DashboardShell),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Carregando painel...
      </div>
    ),
  },
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  const db = getPrisma();
  const dbCreator = await db.creator.findUnique({
    where: { userId: session.userId },
    include: { user: true },
  });

  if (!dbCreator) {
    redirect("/onboarding");
  }

  const creator = mapDbCreatorToCreator(dbCreator);

  const chatwootBaseUrl =
    process.env.NEXT_PUBLIC_CHATWOOT_URL?.trim() ||
    process.env.CHATWOOT_URL?.trim() ||
    "https://chat.pix.tips";
  const chatwootWebsiteToken =
    process.env.CHATWOOT_WEBSITE_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN?.trim() ||
    "";

  return (
    <DashboardShell
      creator={creator}
      chatwootBaseUrl={chatwootBaseUrl}
      chatwootWebsiteToken={chatwootWebsiteToken}
    >
      {children}
    </DashboardShell>
  );
}
