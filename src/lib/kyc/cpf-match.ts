export function normalizePersonName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseBrazilianBirthDate(value: string): string | null {
  const trimmed = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/.exec(trimmed);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;

  return null;
}

function tokenSet(name: string): Set<string> {
  return new Set(
    normalizePersonName(name)
      .split(" ")
      .filter((part) => part.length > 1),
  );
}

export function namesMatch(a: string, b: string, minOverlap = 0.75): boolean {
  const left = normalizePersonName(a);
  const right = normalizePersonName(b);

  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;

  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);
  if (leftTokens.size === 0 || rightTokens.size === 0) return false;

  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) overlap += 1;
  }

  const ratio = overlap / Math.min(leftTokens.size, rightTokens.size);
  return ratio >= minOverlap;
}

export function birthDatesMatch(a: string, b: string): boolean {
  const left = parseBrazilianBirthDate(a);
  const right = parseBrazilianBirthDate(b);
  return Boolean(left && right && left === right);
}
