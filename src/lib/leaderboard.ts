import type { DonationPayload, LeaderboardEntry, WidgetDonationItem } from "@/types";

function keyForName(name: string): string {
  return name.trim().toLowerCase() || "anon";
}

export function buildLeaderboardFromItems(items: WidgetDonationItem[]): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>();

  for (const item of items) {
    const key = keyForName(item.name);
    const existing = map.get(key);
    if (existing) {
      existing.amount += item.amount;
      existing.count += 1;
    } else {
      map.set(key, { name: item.name, amount: item.amount, count: 1 });
    }
  }

  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

export function addDonationToLeaderboard(
  entries: LeaderboardEntry[],
  payload: DonationPayload,
): LeaderboardEntry[] {
  const key = keyForName(payload.name);
  const map = new Map(entries.map((entry) => [keyForName(entry.name), { ...entry }]));

  const existing = map.get(key);
  if (existing) {
    existing.amount += payload.amount;
    existing.count += 1;
  } else {
    map.set(key, { name: payload.name, amount: payload.amount, count: 1 });
  }

  return [...map.values()].sort((a, b) => b.amount - a.amount);
}
