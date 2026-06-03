"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { UserProfile } from "@/types";

interface SettingsOAuthFeedbackProps {
  onAccountsUpdate: (accounts: UserProfile["connectedAccounts"]) => void;
  onError: (message: string) => void;
  onToast: (message: string) => void;
}

export function SettingsOAuthFeedback({
  onAccountsUpdate,
  onError,
  onToast,
}: SettingsOAuthFeedbackProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const oauthError = searchParams.get("error");

    if (connected) {
      onToast(`Conta ${connected} vinculada com sucesso!`);
      void fetch("/api/user/oauth-accounts")
        .then((r) => r.json())
        .then((data: { accounts?: UserProfile["connectedAccounts"] }) => {
          if (data.accounts) onAccountsUpdate(data.accounts);
        });
      router.replace("/dashboard/settings");
    } else if (oauthError) {
      onError(oauthError);
      router.replace("/dashboard/settings");
    }
  }, [searchParams, router, onAccountsUpdate, onError, onToast]);

  return null;
}
