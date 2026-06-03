"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/landing-data";

const INITIAL_VISIBLE = 8;

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  const visibleItems = showAll ? FAQ_ITEMS : FAQ_ITEMS.slice(0, INITIAL_VISIBLE);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.6fr] lg:items-start">
          {/* Left: sticky heading */}
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-500">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Dúvidas{" "}
              <span className="web3-text-gradient">frequentes</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Tudo que você precisa saber antes de começar.
            </p>

            <div className="mt-8 rounded-2xl border border-white/5 bg-cyan-500/5 p-5">
              <p className="text-sm text-zinc-400">
                Ainda tem dúvidas? Entre em contato:
              </p>
              <a
                href="mailto:suporte@pix.tips"
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75"
                  />
                </svg>
                suporte@pix.tips
              </a>
            </div>
          </div>

          {/* Right: accordion list */}
          <div className="space-y-2">
            {visibleItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.question}
                  className="web3-glass overflow-hidden rounded-xl border border-white/5 transition-all duration-200 hover:border-white/10"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-white">
                      {item.question}
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-lg leading-none text-cyan-400 transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-zinc-400">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}

            {FAQ_ITEMS.length > INITIAL_VISIBLE && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 py-3 text-sm text-zinc-400 transition-colors hover:border-cyan-500/20 hover:text-cyan-400"
              >
                {showAll ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    Ver menos
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    Ver mais {FAQ_ITEMS.length - INITIAL_VISIBLE} perguntas
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
