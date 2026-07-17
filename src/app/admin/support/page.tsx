import { AdminSupportPanel } from "@/components/admin/AdminSupportPanel";
import {
  getChatwootUrl,
  listSupportCreators,
} from "@/lib/repositories/admin-support-repository";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const [creators, chatwootUrl] = await Promise.all([
    listSupportCreators(),
    Promise.resolve(getChatwootUrl()),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Suporte</h2>
        <p className="text-sm text-zinc-400">
          Chatwoot + contatos dos criadores para atendimento.
        </p>
      </div>
      <AdminSupportPanel
        chatwootUrl={chatwootUrl}
        creators={structuredClone(creators)}
      />
    </div>
  );
}
