import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?redirect=/admin");
  }

  const db = getPrisma();
  const user = await db.user.findUnique({ where: { id: session.userId } });

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AdminShell userName={user.name} userEmail={user.email}>
      {children}
    </AdminShell>
  );
}
