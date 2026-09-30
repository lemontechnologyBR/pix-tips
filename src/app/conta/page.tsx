import { FanAccountHub } from "@/components/fan/FanAccountHub";
import { TipPageShell } from "@/components/tip/TipPageShell";

export const dynamic = "force-dynamic";

export default function ContaPage() {
  return (
    <TipPageShell>
      <FanAccountHub />
    </TipPageShell>
  );
}
