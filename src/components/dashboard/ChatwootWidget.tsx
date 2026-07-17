"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot?: {
      setUser: (
        identifier: string,
        user: {
          email?: string;
          name?: string;
          avatar_url?: string;
        },
      ) => void;
      setCustomAttributes: (attrs: Record<string, string | number | boolean>) => void;
      reset: () => void;
    };
  }
}

export interface ChatwootWidgetUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
}

interface ChatwootWidgetProps {
  baseUrl: string;
  websiteToken: string;
  user?: ChatwootWidgetUser | null;
}

function identifyUser(user: ChatwootWidgetUser) {
  if (!window.$chatwoot) return;
  window.$chatwoot.setUser(user.id, {
    email: user.email,
    name: user.name,
    avatar_url: user.avatar || undefined,
  });
  window.$chatwoot.setCustomAttributes({
    username: user.username,
    creator_id: user.id,
  });
}

/**
 * Floating Chatwoot support bubble (creator dashboard).
 * No-op when websiteToken is empty.
 */
export function ChatwootWidget({ baseUrl, websiteToken, user }: ChatwootWidgetProps) {
  useEffect(() => {
    const token = websiteToken.trim();
    const origin = baseUrl.replace(/\/$/, "") || "https://chat.pix.tips";
    if (!token || typeof window === "undefined") return;

    const onReady = () => {
      if (user) identifyUser(user);
    };
    window.addEventListener("chatwoot:ready", onReady);

    if (window.$chatwoot) {
      onReady();
      return () => window.removeEventListener("chatwoot:ready", onReady);
    }

    if (document.getElementById("chatwoot-sdk")) {
      return () => window.removeEventListener("chatwoot:ready", onReady);
    }

    const script = document.createElement("script");
    script.id = "chatwoot-sdk";
    script.src = `${origin}/packs/js/sdk.js`;
    script.async = true;
    script.onload = () => {
      window.chatwootSDK?.run({ websiteToken: token, baseUrl: origin });
    };
    document.body.appendChild(script);

    return () => {
      window.removeEventListener("chatwoot:ready", onReady);
    };
  }, [baseUrl, websiteToken, user]);

  return null;
}
