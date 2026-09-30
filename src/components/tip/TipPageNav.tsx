"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND_NAME, SITE_URL } from "@/lib/brand";
import { DiscordIcon } from "@/components/shared/SocialProviderIcons";
import { useTipFanSession } from "./TipFanSessionContext";

const FAN_PAGE_KEY = "pixtips_fan_page";
const RESERVED_SEGMENTS = new Set([
  "conta",
  "login",
  "register",
  "dashboard",
  "onboarding",
  "admin",
  "api",
  "widget",
  "help",
  "blog",
]);

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function TipPageNav() {
  const pathname = usePathname();
  const { fan, loading, setFan } = useTipFanSession();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [fanPage, setFanPage] = useState<{
    username: string;
    displayName: string;
    avatar: string;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seg = pathname.split("/").filter(Boolean);
    if (seg.length === 1 && !RESERVED_SEGMENTS.has(seg[0])) {
      sessionStorage.setItem(FAN_PAGE_KEY, seg[0]);
    }
  }, [pathname]);

  useEffect(() => {
    const seg = pathname.split("/").filter(Boolean);
    const onThisTip = seg.length === 1 && !RESERVED_SEGMENTS.has(seg[0]);
    let fromReferrer: string | null = null;
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin) {
          const refSeg = ref.pathname.split("/").filter(Boolean);
          if (refSeg.length === 1 && !RESERVED_SEGMENTS.has(refSeg[0])) {
            fromReferrer = refSeg[0];
            sessionStorage.setItem(FAN_PAGE_KEY, refSeg[0]);
          }
        }
      } catch {
        fromReferrer = null;
      }
    }
    const fromUrl =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("from")
        : null;
    const stored =
      fromUrl ||
      fromReferrer ||
      (typeof window !== "undefined" ? sessionStorage.getItem(FAN_PAGE_KEY) : null) ||
      fan?.lastCreator?.username ||
      null;
    const username = onThisTip ? seg[0] : stored;
    if (!username || RESERVED_SEGMENTS.has(username)) {
      setFanPage(null);
      return;
    }
    let cancelled = false;
    void fetch(`/api/creators/${encodeURIComponent(username)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.creator) return;
        setFanPage({
          username: data.creator.username,
          displayName: data.creator.displayName,
          avatar: data.creator.avatar || "",
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname, fan?.lastCreator?.username]);

  useEffect(() => {
    const onAccount = pathname === "/conta";
    if (!fan || onAccount || !fanPage?.displayName) return;
    const name = fanPage.displayName.trim();
    const hidden: HTMLElement[] = [];
    document.querySelectorAll("h1").forEach((node) => {
      const h1 = node as HTMLElement;
      if (h1.textContent?.trim() !== name) return;
      let hero: HTMLElement | null = h1.parentElement;
      let cursor: HTMLElement | null = h1.parentElement;
      while (cursor?.parentElement) {
        const parent = cursor.parentElement;
        if (parent.tagName === "MAIN" || parent.tagName === "BODY") break;
        if (parent.querySelector("[data-donation], form")) break;
        if (parent.querySelector("img")) hero = parent;
        cursor = parent;
      }
      if (hero && hero.style.display !== "none") {
        hero.style.display = "none";
        hidden.push(hero);
      }
    });
    return () => {
      hidden.forEach((el) => {
        el.style.display = "";
      });
    };
  }, [fan, pathname, fanPage?.displayName]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setFan(null);
      setOpen(false);
      window.location.reload();
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) return null;
  if (!fan && pathname !== "/conta") return null;

  const hasDiscord = fan?.providers.includes("discord") ?? false;
  const returnTo = pathname || "/";
  const onConta = pathname === "/conta";

  function goSection(id: "perfil" | "badges" | "missoes" | "assinaturas") {
    setOpen(false);
    if (pathname === "/conta") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `/conta#${id}`);
      return;
    }
    window.location.href = `/conta#${id}`;
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          {fan && fanPage ? (
            onConta ? (
              <Link
                href={`/${fanPage.username}`}
                className="flex min-w-0 items-center gap-2.5"
              >
                {fanPage.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fanPage.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold">
                    {fanPage.displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="truncate text-sm font-semibold text-white">
                  {fanPage.displayName}
                </span>
              </Link>
            ) : (
              <div className="flex min-w-0 items-center gap-2.5">
                {fanPage.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fanPage.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold">
                    {fanPage.displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="truncate text-sm font-semibold text-white">
                  {fanPage.displayName}
                </span>
              </div>
            )
          ) : (
            !onConta && (
              <a
                href={SITE_URL}
                className="shrink-0 text-sm font-semibold tracking-tight text-white"
              >
                <span className="text-white">pix</span>
                <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                  .tips
                </span>
                <span className="sr-only">{BRAND_NAME}</span>
              </a>
            )
          )}
        </div>

        <div className="relative" ref={menuRef}>
          {fan ? (
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="menu"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/80 py-1 pl-1 pr-3 transition hover:border-sky-400/40"
            >
              {fan.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fan.avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-[11px] font-bold text-white">
                  {initials(fan.name)}
                </span>
              )}
              <span className="hidden max-w-[10rem] truncate text-sm font-medium text-zinc-100 sm:block">
                {fan.name}
              </span>
              <span className="text-[10px] text-zinc-500">▾</span>
            </button>
          ) : null}

          {open && fan && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-2xl shadow-black/50"
            >
              <div className="border-b border-zinc-800 px-4 py-3">
                <p className="truncate text-sm font-medium text-white">{fan.name}</p>
                <p className="truncate text-[11px] text-zinc-500">{fan.email}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-sky-400/80">
                  {fan.hasCreator ? "Criador" : "Conta de fã"}
                </p>
              </div>

              {fan.hasCreator ? (
                <>
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Perfil
                  </Link>
                  {fan.username && (
                    <Link
                      href={`/${fan.username}`}
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      Minha tip page
                    </Link>
                  )}
                  <Link
                    href="/dashboard/settings"
                    role="menuitem"
                    className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Configurações
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    onClick={() => goSection("perfil")}
                  >
                    Meu perfil
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    onClick={() => goSection("badges")}
                  >
                    Badges
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    onClick={() => goSection("missoes")}
                  >
                    Missões
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    onClick={() => goSection("assinaturas")}
                  >
                    Apoio mensal
                  </button>
                  {!hasDiscord && (
                    <a
                      href={`/api/auth/oauth/discord?mode=link&returnTo=${encodeURIComponent(returnTo)}`}
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      title="Conecta pra receber cargo no Discord do criador quando tipar ou completar missões"
                    >
                      <DiscordIcon className="h-4 w-4" />
                      Conectar Discord
                    </a>
                  )}
                  {hasDiscord && (
                    <p className="flex items-center gap-2 px-4 py-2 text-[11px] text-zinc-500">
                      <DiscordIcon className="h-3.5 w-3.5" />
                      Discord conectado ✓
                    </p>
                  )}
                </>
              )}

              <button
                type="button"
                role="menuitem"
                disabled={loggingOut}
                className="block w-full border-t border-zinc-800 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-zinc-900 disabled:opacity-50"
                onClick={() => void logout()}
              >
                {loggingOut ? "Saindo…" : "Sair"}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
