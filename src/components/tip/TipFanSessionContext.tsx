"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface TipFanSession {
  id: string;
  name: string;
  email: string;
  username: string | null;
  avatar: string | null;
  hasCreator: boolean;
  providers: string[];
  lastCreator: { username: string; displayName: string; avatar: string } | null;
}

interface TipFanSessionContextValue {
  fan: TipFanSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setFan: (fan: TipFanSession | null) => void;
}

const TipFanSessionContext = createContext<TipFanSessionContextValue | null>(
  null,
);

export function TipFanSessionProvider({ children }: { children: ReactNode }) {
  const [fan, setFan] = useState<TipFanSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setFan(null);
        return;
      }
      const data = await res.json();
      if (!data.user) {
        setFan(null);
        return;
      }
      setFan({
        id: data.user.id,
        name:
          data.user.name ||
          data.user.creator?.displayName ||
          "Fã",
        email: data.user.email,
        username: data.user.creator?.username ?? null,
        avatar: data.user.avatar || data.user.creator?.avatar || null,
        hasCreator: Boolean(data.user.creator),
        providers: Array.isArray(data.providers) ? data.providers : [],
        lastCreator: data.lastCreator ?? null,
      });
    } catch {
      setFan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ fan, loading, refresh, setFan }),
    [fan, loading, refresh],
  );

  return (
    <TipFanSessionContext.Provider value={value}>
      {children}
    </TipFanSessionContext.Provider>
  );
}

export function useTipFanSession() {
  const ctx = useContext(TipFanSessionContext);
  if (!ctx) {
    throw new Error("useTipFanSession must be used within TipFanSessionProvider");
  }
  return ctx;
}
