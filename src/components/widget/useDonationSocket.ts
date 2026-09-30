"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import type { DonationPayload } from "@/types";
import type { AlertControlAction } from "@/lib/alert-controls";

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
  onAlertControl?: (action: AlertControlAction) => void,
) {
  useEffect(() => {
    if (previewMode) return;

    const socket: Socket = io("/alerts", {
      path: "/api/socket",
      auth: { userId, token },
    });

    socket.on("new-donation", onDonation);
    if (onAlertControl) {
      socket.on("alert-control", (payload: { action?: AlertControlAction }) => {
        if (payload?.action) onAlertControl(payload.action);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [userId, token, previewMode, onDonation, onAlertControl]);
}

export function widgetShellClass(previewMode?: boolean): string {
  return previewMode
    ? "pointer-events-none absolute inset-0 overflow-hidden"
    : "pointer-events-none fixed inset-0 z-[9998] overflow-hidden";
}
