"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { NAV_LINKS } from "@/lib/landing-data";


export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/5 bg-zinc-950/80 shadow-2xl shadow-black/50 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative px-3 py-2 text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="web3-btn-primary rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/50 hover:shadow-lg"
          >
            Criar conta
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          className="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-zinc-800 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg
            className={`h-6 w-6 transition-transform duration-300 ${menuOpen ? "rotate-90" : "rotate-0"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="web3-glass-strong border-t border-white/5 px-4 py-4">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-cyan-500/10 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 border-t border-white/5" />
            <Link
              href="/login"
              className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-cyan-500/10 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="web3-btn-primary mt-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-white shadow-cyan-500/25 transition-all hover:shadow-cyan-500/50 hover:shadow-lg"
              onClick={() => setMenuOpen(false)}
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
