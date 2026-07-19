import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { getSessionFromCookies } from "@/lib/auth/session";
import * as creatorRepo from "@/lib/repositories/creator-repository";

export default async function OnboardingPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login?redirect=/onboarding");

  const creator =
    (await creatorRepo.getById(session.creatorId)) ??
    (await creatorRepo.getByUserId(session.userId));

  if (creator?.onboardingCompleted && !session.onboardingCompleted) {
    redirect("/api/onboarding/sync-session");
  }

  if (session.onboardingCompleted) {
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
