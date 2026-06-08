import { NextResponse } from "next/server";
import { runWeeklySummaryJob } from "@/lib/email";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === secret;
}

/** Disparado por cron externo (ex: Hostinger cron, cron-job.org) toda segunda às 9h. */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const result = await runWeeklySummaryJob();
  return NextResponse.json({ ok: true, ...result });
}
