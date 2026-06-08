/**
 * LEGADO — NÃO OPERACIONAL
 *
 * Este fluxo de saque manual (criador solicita → admin processa manualmente)
 * foi descontinuado. O saque automático agora é feito diretamente via Woovi
 * Pix Out, sem intervenção manual.
 *
 * Use: POST /api/user/woovi/withdraw
 *
 * Esta rota retorna 410 Gone para evitar chamadas acidentais de clientes
 * antigos ou integrações desatualizadas.
 */
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Este fluxo de saque foi descontinuado. Use o saque pelo painel Financeiro.",
    },
    { status: 410 },
  );
}
