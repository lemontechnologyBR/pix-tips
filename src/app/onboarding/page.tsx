import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { ensureCreatorForUser } from "@/lib/auth/oauth";
import { getSessionFromCookies, setSessionCookie } from "@/lib/auth/session";
import * as creatorRepo from "@/lib/repositories/creator-repository";
import { getPrisma } from "@/lib/db";

export default async function OnboardingPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login?redirect=/onboarding");

  let creator =
    (session.creatorId ? await creatorRepo.getById(session.creatorId) : null) ??
    (await creatorRepo.getByUserId(session.userId));

  // Fã virando streamer: cria tip page na hora do onboarding
  if (!creator) {
    const created = await ensureCreatorForUser(session.userId);
    creator = await creatorRepo.getById(created.id);
    if (creator) {
      const db = getPrisma();
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { role: true, email: true },
      });
      await setSessionCookie({
        userId: session.userId,
        creatorId: creator.id,
        email: user?.email ?? session.email,
        role: user?.role ?? session.role,
        onboardingCompleted: false,
      });
    }
  }

  if (creator?.onboardingCompleted && !session.onboardingCompleted) {
    redirect("/api/onboarding/sync-session");
  }

  if (session.onboardingCompleted && creator) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-10">
      <Suspense fallback={null}>
        <OnboardingWizard
          initialUsername={creator?.username ?? ""}
          initialDisplayName={creator?.displayName ?? ""}
        />
      </Suspense>
    </div>
  );
}
