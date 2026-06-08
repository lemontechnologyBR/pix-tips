/**
 * Sincroniza contatos com a audience de marketing do Resend.
 * Requer RESEND_API_KEY e RESEND_AUDIENCE_ID configurados.
 */

export async function syncMarketingContact(
  email: string,
  name: string,
  subscribed: boolean,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();

  if (!apiKey || !audienceId) {
    if (subscribed) {
      console.warn(
        "[email:audience] RESEND_AUDIENCE_ID não configurado — contato não sincronizado:",
        email,
      );
    }
    return;
  }

  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      first_name: name.split(" ")[0] ?? name,
      last_name: name.split(" ").slice(1).join(" ") || undefined,
      unsubscribed: !subscribed,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email:audience] Erro ao sincronizar contato:", err);
  }
}
