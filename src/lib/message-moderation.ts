const DEFAULT_BLOCKED_WORDS = [
  "puto",
  "puta",
  "caralho",
  "porra",
  "merda",
  "viado",
  "cuzão",
  "cuzao",
  "fdp",
  "arrombado",
  "vagabunda",
  "vagabundo",
];

export function normalizeMessageText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseBlockedWords(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const words = raw
    .filter((w): w is string => typeof w === "string")
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 2 && w.length <= 40);
  return [...new Set(words)].slice(0, 200);
}

export function findBlockedWordInMessage(
  message: string,
  blockedWords: string[],
  includeDefaults = false,
): string | null {
  const haystack = normalizeMessageText(message);
  if (!haystack) return null;

  const list = includeDefaults
    ? [...new Set([...DEFAULT_BLOCKED_WORDS, ...blockedWords])]
    : blockedWords;

  for (const word of list) {
    const needle = normalizeMessageText(word);
    if (!needle) continue;
    // word boundary-ish match so "cu" doesn't match "curso"
    const re = new RegExp(`(^|\\s)${escapeRegex(needle)}(\\s|$)`, "i");
    if (re.test(haystack)) return word;
  }
  return null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { DEFAULT_BLOCKED_WORDS };
