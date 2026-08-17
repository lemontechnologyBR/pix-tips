"use client";

import { useCallback, useRef, useState } from "react";
import type {
  AdminStreamerChannelRow,
  AdminStreamerChannelsResult,
  StreamChannelProvider,
} from "@/lib/repositories/admin-channels-repository";

interface AdminChannelsPanelProps {
  initial: AdminStreamerChannelsResult;
}

const FILTERS: { id: "all" | StreamChannelProvider; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "twitch", label: "Twitch" },
  { id: "kick", label: "Kick" },
  { id: "youtube", label: "YouTube" },
  { id: "discord", label: "Discord" },
];

const PROVIDER_STYLE: Record<
  StreamChannelProvider,
  { label: string; className: string }
> = {
  twitch: { label: "Twitch", className: "text-violet-300" },
  kick: { label: "Kick", className: "text-lime-300" },
  youtube: { label: "YouTube", className: "text-red-300" },
  discord: { label: "Discord", className: "text-indigo-300" },
};

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function ChannelCell({
  row,
  provider,
}: {
  row: AdminStreamerChannelRow;
  provider: StreamChannelProvider;
}) {
  const channel = row.channels.find((c) => c.provider === provider);
  if (!channel) {
    return <span className="text-zinc-600">—</span>;
  }

  const label = channel.handle
    ? provider === "youtube" && !channel.handle.startsWith("UC")
      ? `@${channel.handle.replace(/^@/, "")}`
      : channel.handle
    : "conectado";

  if (!channel.url) {
    return (
      <span className={`font-mono text-xs ${PROVIDER_STYLE[provider].className}`}>
        {label}
      </span>
    );
  }

  return (
    <a
      href={channel.url}
      target="_blank"
      rel="noreferrer"
      className={`font-mono text-xs hover:underline ${PROVIDER_STYLE[provider].className}`}
    >
      {label}
    </a>
  );
}

export function AdminChannelsPanel({ initial }: AdminChannelsPanelProps) {
  const [data, setData] = useState(initial);
  const [platform, setPlatform] = useState<"all" | StreamChannelProvider>("all");
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (p: number, q: string, plat: "all" | StreamChannelProvider) => {
      setFetching(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          search: q,
          platform: plat,
          limit: "20",
        });
        const res = await fetch(`/api/admin/channels?${params.toString()}`);
        if (!res.ok) return;
        const json = (await res.json()) as AdminStreamerChannelsResult;
        setData(json);
      } finally {
        setFetching(false);
      }
    },
    [],
  );

  function handleFilter(next: "all" | StreamChannelProvider) {
    setPlatform(next);
    void load(1, search, next);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => void load(1, value, platform), 350);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Criadores com canal" value={data.counts.creatorsWithChannels} />
        <Metric label="Twitch" value={data.counts.twitch} />
        <Metric label="Kick" value={data.counts.kick} />
        <Metric label="YouTube" value={data.counts.youtube} />
        <Metric label="Discord" value={data.counts.discord} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFilter(f.id)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                platform === f.id
                  ? "bg-red-600/20 text-red-300"
                  : "border border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar criador ou canal..."
          className="w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
        />
      </div>

      {fetching ? (
        <div className="rounded-xl border border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Carregando...
        </div>
      ) : data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-500">
          Nenhum canal vinculado ainda.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-left text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Criador</th>
                  <th className="px-4 py-3">Tip page</th>
                  <th className="px-4 py-3">Twitch</th>
                  <th className="px-4 py-3">Kick</th>
                  <th className="px-4 py-3">YouTube</th>
                  <th className="px-4 py-3">Discord</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((row) => (
                  <tr
                    key={row.creatorId}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.displayName}</p>
                      <p className="text-xs text-zinc-500">
                        @{row.username}
                        {row.plan === "pro" ? (
                          <span className="ml-2 text-amber-400">Pro</span>
                        ) : null}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={row.tipPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-cyan-300 hover:underline"
                      >
                        /{row.username}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <ChannelCell row={row} provider="twitch" />
                    </td>
                    <td className="px-4 py-3">
                      <ChannelCell row={row} provider="kick" />
                    </td>
                    <td className="px-4 py-3">
                      <ChannelCell row={row} provider="youtube" />
                    </td>
                    <td className="px-4 py-3">
                      <ChannelCell row={row} provider="discord" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {data.total} {data.total === 1 ? "criador" : "criadores"}
            </p>
            {data.totalPages > 1 ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={data.page <= 1 || fetching}
                  onClick={() => void load(data.page - 1, search, platform)}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-white disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-zinc-500">
                  Página {data.page} de {data.totalPages}
                </span>
                <button
                  type="button"
                  disabled={data.page >= data.totalPages || fetching}
                  onClick={() => void load(data.page + 1, search, platform)}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-white disabled:opacity-40"
                >
                  Próxima →
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
