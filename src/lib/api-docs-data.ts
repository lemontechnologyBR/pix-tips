export interface ApiEndpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  curl: string;
}

export interface WebhookEvent {
  name: string;
  description: string;
  payloadExample: string;
}

export const API_DOCS = {
  baseUrl: "https://api.pix.tips/v1",
  version: "beta",
  authentication: {
    title: "Autenticação",
    description:
      "Todas as requisições autenticadas exigem o header Authorization com sua chave de API. Gere a chave em Configurações do dashboard ou via GET /api/user/api-key.",
    headerName: "Authorization",
    headerExample: "Bearer tp_live_xxxxxxxx",
    note: "Nunca exponha sua chave no front-end público. Use apenas em servidor ou automações.",
  },
  webhooks: [
    {
      name: "donation.created",
      description:
        "Disparado quando uma doação é iniciada (Pix gerado ou cartão em processamento).",
      payloadExample: `{
  "event": "donation.created",
  "data": {
    "id": "txn_abc123",
    "amount": 25.00,
    "currency": "BRL",
    "status": "pending",
    "donor_name": "Maria",
    "created_at": "2026-05-28T14:00:00Z"
  }
}`,
    },
    {
      name: "donation.confirmed",
      description: "Disparado quando o pagamento é confirmado e o alerta pode ser exibido.",
      payloadExample: `{
  "event": "donation.confirmed",
  "data": {
    "id": "txn_abc123",
    "amount": 25.00,
    "status": "confirmed",
    "method": "pix",
    "confirmed_at": "2026-05-28T14:02:11Z"
  }
}`,
    },
    {
      name: "donation.failed",
      description: "Disparado quando o pagamento expira, é recusado ou cancelado.",
      payloadExample: `{
  "event": "donation.failed",
  "data": {
    "id": "txn_abc123",
    "amount": 25.00,
    "status": "failed",
    "reason": "expired"
  }
}`,
    },
  ] satisfies WebhookEvent[],
  endpoints: [
    {
      method: "GET",
      path: "/me",
      description: "Retorna dados do criador autenticado (perfil público e metas).",
      curl: `curl -X GET "https://api.pix.tips/v1/me" \\
  -H "Authorization: Bearer tp_live_SUA_CHAVE"`,
    },
    {
      method: "GET",
      path: "/donations",
      description: "Lista doações com paginação e filtros por status e período.",
      curl: `curl -X GET "https://api.pix.tips/v1/donations?status=confirmed&limit=20" \\
  -H "Authorization: Bearer tp_live_SUA_CHAVE"`,
    },
    {
      method: "GET",
      path: "/donations/{id}",
      description: "Detalhes de uma transação específica.",
      curl: `curl -X GET "https://api.pix.tips/v1/donations/txn_abc123" \\
  -H "Authorization: Bearer tp_live_SUA_CHAVE"`,
    },
    {
      method: "POST",
      path: "/webhooks",
      description: "Registra URL de webhook para receber eventos de doação.",
      curl: `curl -X POST "https://api.pix.tips/v1/webhooks" \\
  -H "Authorization: Bearer tp_live_SUA_CHAVE" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://seu-servidor.com/hooks/tip-page","events":["donation.confirmed"]}'`,
    },
    {
      method: "POST",
      path: "/test-alert",
      description: "Envia alerta de teste para o widget conectado (rate limit: 10/h).",
      curl: `curl -X POST "https://api.pix.tips/v1/test-alert" \\
  -H "Authorization: Bearer tp_live_SUA_CHAVE" \\
  -H "Content-Type: application/json" \\
  -d '{"amount":10,"donor_name":"API Test"}'`,
    },
  ] satisfies ApiEndpoint[],
};
