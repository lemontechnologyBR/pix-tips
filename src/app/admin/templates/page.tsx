import { redirect } from "next/navigation";

/** Legado: Templates Free/Pro removido — redireciona para Suporte. */
export default function AdminTemplatesRedirectPage() {
  redirect("/admin/support");
}
