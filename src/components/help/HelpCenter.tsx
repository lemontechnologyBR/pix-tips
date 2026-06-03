"use client";

import { useMemo, useState } from "react";
import { HELP_SECTIONS } from "@/lib/help-data";

export function HelpCenter() {
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>("primeiros-passos-0");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) return HELP_SECTIONS;

    return HELP_SECTIONS.map((section) => ({
      ...section,
      faqs: section.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(normalizedQuery) ||
          faq.answer.toLowerCase().includes(normalizedQuery) ||
          section.title.toLowerCase().includes(normalizedQuery)
      ),
    })).filter((section) => section.faqs.length > 0);
  }, [normalizedQuery]);

  function toggle(sectionId: string, index: number) {
    const key = `${sectionId}-${index}`;
    setOpenKey((prev) => (prev === key ? null : key));
  }

  return (
    <div>
      <div className="relative">
        <label htmlFor="help-search" className="sr-only">
          Buscar na central de ajuda
        </label>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          id="help-search"
          type="search"
          placeholder="Buscar artigos, alertas, pagamentos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />
      </div>

      {filteredSections.length === 0 ? (
        <p className="mt-12 text-center text-zinc-500">
          Nenhum resultado para &quot;{query}&quot;. Tente outras palavras ou{" "}
          <a href="mailto:suporte@pix.tips" className="text-cyan-400 hover:underline">
            fale com o suporte
          </a>
          .
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          {filteredSections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <div className="mt-4 space-y-3">
                {section.faqs.map((faq, index) => {
                  const key = `${section.id}-${index}`;
                  const isOpen = openKey === key;
                  return (
                    <div
                      key={faq.question}
                      className="web3-card overflow-hidden rounded-xl"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(section.id, index)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-white hover:bg-cyan-500/5"
                        aria-expanded={isOpen}
                      >
                        {faq.question}
                        <span
                          className={`ml-4 shrink-0 text-cyan-400 transition ${isOpen ? "rotate-45" : ""}`}
                        >
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-zinc-800 px-5 py-4 text-sm leading-relaxed text-zinc-400">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
