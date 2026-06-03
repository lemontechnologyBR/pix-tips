"use client";

import Link from "next/link";
import { tipPagePath } from "@/lib/brand";
import { useMemo, useState } from "react";
import {
  EXAMPLE_CATEGORIES,
  EXAMPLE_CREATORS,
  type ExampleCreator,
} from "@/lib/examples-data";

export function ExamplesGallery() {
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    if (category === "all") return EXAMPLE_CREATORS;
    return EXAMPLE_CREATORS.filter((c) => c.category === category);
  }, [category]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === cat.id
                ? "web3-btn-primary text-white"
                : "border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-zinc-500">
          Nenhum exemplo nesta categoria ainda.
        </p>
      )}
    </div>
  );
}

function CreatorCard({ creator }: { creator: ExampleCreator }) {
  return (
    <Link
      href={tipPagePath(creator.username)}
      className="web3-card group overflow-hidden rounded-xl transition hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/20"
    >
      <div className={`h-28 bg-gradient-to-br ${creator.accent} opacity-80 transition group-hover:opacity-100`} />
      <div className="p-5">
        <h3 className="font-semibold text-white group-hover:text-cyan-300">
          {creator.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{creator.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {creator.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm font-medium text-cyan-400">Ver página demo →</p>
      </div>
    </Link>
  );
}
