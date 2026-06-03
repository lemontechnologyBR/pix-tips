const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "dashboard",
  "demo",
  "help",
  "login",
  "onboarding",
  "register",
  "settings",
  "support",
  "tip",
  "widget",
]);

export function slugifyUsername(username: string): string {
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidUsername(username: string): boolean {
  const slug = slugifyUsername(username);
  if (!USERNAME_REGEX.test(slug)) return false;
  return !RESERVED_USERNAMES.has(slug);
}

export function isUsernameAvailableSlug(slug: string): boolean {
  return USERNAME_REGEX.test(slug) && !RESERVED_USERNAMES.has(slug);
}
