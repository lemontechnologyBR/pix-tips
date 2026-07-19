export const GOOGLE_ADS_ID = "AW-18326325494";
export const GOOGLE_ADS_SIGNUP_LABEL = "4V3sCl-VzdIcEPaR1qJE";
export const GOOGLE_ADS_SIGNUP_SEND_TO = `${GOOGLE_ADS_ID}/${GOOGLE_ADS_SIGNUP_LABEL}`;

const SIGNUP_TRACKED_KEY = "gads_signup_conversion";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function fireSignupConversion(): boolean {
  const gtag = window.gtag;
  if (typeof gtag !== "function") return false;
  gtag("event", "conversion", {
    send_to: GOOGLE_ADS_SIGNUP_SEND_TO,
  });
  return true;
}

/** Dispara a conversão Google Ads "Inscrição" (uma vez por sessão). */
export function trackGoogleAdsSignupConversion(): void {
  if (typeof window === "undefined") return;

  try {
    if (window.sessionStorage.getItem(SIGNUP_TRACKED_KEY) === "1") return;
  } catch {
    // ignore
  }

  const markTracked = () => {
    try {
      window.sessionStorage.setItem(SIGNUP_TRACKED_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (fireSignupConversion()) {
    markTracked();
    return;
  }

  // gtag ainda carregando (strategy afterInteractive)
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (fireSignupConversion()) {
      markTracked();
      window.clearInterval(timer);
      return;
    }
    if (attempts >= 20) {
      window.clearInterval(timer);
    }
  }, 250);
}
