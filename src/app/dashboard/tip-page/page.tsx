import { TipPageEditor } from "@/components/dashboard/TipPageEditor";
import { getCurrentCreator } from "@/lib/auth";
import { normalizeTipPageSettings } from "@/lib/tip-page-defaults";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha página",
};

export default async function TipPageEditorPage() {
  const creator = await getCurrentCreator();
  const normalized = {
    ...creator,
    tipPageSettings: normalizeTipPageSettings(creator.tipPageSettings),
  };
  return <TipPageEditor initialCreator={structuredClone(normalized)} />;
}
