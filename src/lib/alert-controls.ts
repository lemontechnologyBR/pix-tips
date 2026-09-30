export type AlertControlAction = "pause" | "resume" | "skip" | "replay" | "clear";

export interface AlertControlPayload {
  action: AlertControlAction;
}

export function isAlertControlAction(value: unknown): value is AlertControlAction {
  return (
    value === "pause" ||
    value === "resume" ||
    value === "skip" ||
    value === "replay" ||
    value === "clear"
  );
}
