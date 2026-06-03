"use client";

import type { Creator } from "@/types";

interface CreatorHeaderProps {
  creator: Pick<Creator, "displayName" | "bio" | "avatar" | "themeColor">;
}

export function CreatorHeader({ creator }: CreatorHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <div
        className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/10"
        style={{ boxShadow: `0 0 0 4px ${creator.themeColor}40` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={creator.avatar}
          alt={creator.displayName}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
        <p className="mt-1 max-w-md text-sm text-zinc-400">{creator.bio}</p>
      </div>
    </header>
  );
}
