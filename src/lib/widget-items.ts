import type { DonationPayload } from "@/types";

export function donationToWidgetItem(
  payload: DonationPayload,
  id?: string,
): { id: string; name: string; amount: number; message: string } {
  return {
    id: id ?? `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: payload.name,
    amount: payload.amount,
    message: payload.message,
  };
}

export function transactionToWidgetItem(t: {
  id: string;
  donorName: string;
  anonymous: boolean;
  amount: number;
  message: string;
}): { id: string; name: string; amount: number; message: string } {
  return {
    id: t.id,
    name: t.anonymous ? "Anônimo" : t.donorName,
    amount: t.amount,
    message: t.message,
  };
}

export const PREVIEW_DONATIONS = [
  { id: "p1", name: "Maria", amount: 25, message: "Bora na live!" },
  { id: "p2", name: "João", amount: 50, message: "" },
  { id: "p3", name: "Anônimo", amount: 10, message: "Parabéns!" },
];
