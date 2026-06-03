import { Suspense } from "react";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { getCurrentCreator } from "@/lib/auth";
import { getUserProfile } from "@/lib/store";

function SettingsLoading() {
  return (
    <div className="w-full animate-pulse space-y-6">
      <div className="h-40 rounded-2xl bg-zinc-900" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="h-20 rounded-xl bg-zinc-900" />
        <div className="h-20 rounded-xl bg-zinc-900" />
        <div className="h-20 rounded-xl bg-zinc-900" />
        <div className="h-20 rounded-xl bg-zinc-900" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72 rounded-2xl bg-zinc-900" />
        <div className="h-72 rounded-2xl bg-zinc-900" />
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const creator = await getCurrentCreator();
  const profile = await getUserProfile(creator.id);

  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsForm profile={profile} />
    </Suspense>
  );
}
