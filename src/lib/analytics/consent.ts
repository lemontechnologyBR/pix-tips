const STORAGE_KEY = "cookie-consent-preferences";

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const prefs = JSON.parse(raw) as { analytics?: boolean };
    return prefs.analytics !== false;
  } catch {
    return true;
  }
}
