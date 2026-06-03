import { cookies } from "next/headers";
import { getPrisma } from "@/lib/db";
import { buildSessionCookie, createSession } from "./session";

/** Só use em Route Handlers — não chame em Server Components. */
export async function refreshSessionCookieForCreator(creatorId: string): Promise<void> {
  const row = await getPrisma().creator.findUnique({
    where: { id: creatorId },
    select: {
      id: true,
      userId: true,
      onboardingCompleted: true,
      user: { select: { email: true, role: true } },
    },
  });
  if (!row) return;

  const token = await createSession({
    userId: row.userId,
    creatorId: row.id,
    email: row.user.email,
    role: row.user.role,
    onboardingCompleted: row.onboardingCompleted,
  });
  const cookieStore = await cookies();
  cookieStore.set(buildSessionCookie(token));
}
