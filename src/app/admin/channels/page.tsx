import { AdminChannelsPanel } from "@/components/admin/AdminChannelsPanel";
import { getAdminStreamerChannels } from "@/lib/repositories/admin-channels-repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Canais",
};

export const dynamic = "force-dynamic";

export default async function AdminChannelsPage() {
  const initial = await getAdminStreamerChannels({ page: 1, limit: 20 });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Canais de streamers</h2>
        <p className="text-sm text-zinc-400">
          Twitch, Kick, YouTube e Discord vinculados pelos criadores. Clique no
          handle para abrir o canal.
        </p>
      </div>
      <AdminChannelsPanel initial={structuredClone(initial)} />
    </div>
  );
}
