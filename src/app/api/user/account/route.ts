import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { isSessionError, requireSession } from "@/lib/auth/require-session";
import { deleteUserAccount } from "@/lib/store";

export async function DELETE(request: Request) {
  try {
    const session = await requireSession();
    if (isSessionError(session)) return session;

    const body = await request.json().catch(() => ({}));
    if (body.confirm !== "EXCLUIR") {
      return NextResponse.json(
        { error: 'Digite "EXCLUIR" para confirmar.' },
        { status: 400 },
      );
    }

    const result = await deleteUserAccount(session.userId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, redirect: "/login" });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Erro ao excluir conta" }, { status: 500 });
  }
}
