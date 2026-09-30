import { MissionsManager } from "@/components/dashboard/MissionsManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recompensas",
};

export default function MissionsPage() {
  return <MissionsManager />;
}
