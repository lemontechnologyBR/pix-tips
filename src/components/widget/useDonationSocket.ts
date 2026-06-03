"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import type { DonationPayload } from "@/types";

export {
  donationToWidgetItem,
  PREVIEW_DONATIONS,
  transactionToWidgetItem,
} from "@/lib/widget-items";

export function useDonationSocket(
  userId: string,
  token: string,
  previewMode: boolean | undefined,
  onDonation: (payload: DonationPayload) => void,
) {
  useEffect(() => {
    if (previewMode) return;

    const socket: Socket = io("/alerts", {
      path: "/api/socket",
      auth: { userId, token },
    });

    socket.on("new-donation", onDonation);

    return () => {
      socket.disconnect();
    };
  }, [userId, token, previewMode, onDonation]);
}

export function widgetShellClass(previewMode?: boolean): string {
  return previewMode
    ? "pointer-events-none absolute inset-0 overflow-hidden"
    : "pointer-events-none fixed inset-0 z-[9998] overflow-hidden";
}
