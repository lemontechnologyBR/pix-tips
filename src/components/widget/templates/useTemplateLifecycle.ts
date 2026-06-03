"use client";

import { useEffect, useMemo, useState } from "react";

export type AnimationPhase = "enter" | "display" | "exit";

export function useTemplateLifecycle(duration: number, onComplete: () => void) {
  const [phase, setPhase] = useState<AnimationPhase>("enter");

  const timings = useMemo(() => {
    const enterMs = duration * 0.15 * 1000;
    const exitMs = duration * 0.15 * 1000;
    const displayMs = duration * 0.7 * 1000;
    return { enterMs, displayMs, exitMs };
  }, [duration]);

  useEffect(() => {
    const displayTimer = setTimeout(() => setPhase("display"), timings.enterMs);
    const exitTimer = setTimeout(
      () => setPhase("exit"),
      timings.enterMs + timings.displayMs,
    );
    const completeTimer = setTimeout(
      onComplete,
      timings.enterMs + timings.displayMs + timings.exitMs,
    );

    return () => {
      clearTimeout(displayTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete, timings]);

  return phase;
}

export function phaseClass(phase: AnimationPhase, prefix: string) {
  return `${prefix}-${phase}`;
}
