import { NextResponse } from "next/server";
import { verifyDiditWebhookSignature } from "@/lib/didit";
import { syncDiditKycForCreator } from "@/lib/kyc/didit-sync";

interface DiditWebhookBody {
  session_id?: string;
  vendor_data?: string;
  status?: string;
  webhook_type?: string;
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const timestamp = request.headers.get("x-timestamp");
  const signatureV2 = request.headers.get("x-signature-v2");

  if (!verifyDiditWebhookSignature(rawBody, timestamp, signatureV2)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let body: DiditWebhookBody;
  try {
    body = JSON.parse(rawBody) as DiditWebhookBody;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const creatorId = body.vendor_data?.trim();
  const sessionId = body.session_id?.trim();

  if (!creatorId || !sessionId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await syncDiditKycForCreator(creatorId, sessionId);
  } catch (error) {
    console.error("[webhooks/didit]", error);
  }

  return NextResponse.json({ ok: true });
}
