"use client";

import { useEffect, useState } from "react";
import type { ViewerPlatformMap } from "@/lib/viewers/types";
import type { GoalOverlayPosition, OverlayDragPoint, ViewersOverlayLayout, ViewersPlatform } from "@/types";
import { ViewersOverlay } from "./ViewersOverlay";
import { widgetShellClass } from "./useDonationSocket";

const DEFAULT_POLL_INTERVAL_MS = 30_000;

interface ViewerPayload {
  viewers: number;
  live: boolean;
  platforms?: ViewerPlatformMap;
}

interface UseViewerCountOptions {
  enabled?: boolean;
  previewViewers?: number;
  previewLive?: boolean;
  pollIntervalSeconds?: number;
}

export function useViewerCount(
  userId: string,
  token: string,
  previewMode: boolean,
  options: UseViewerCountOptions = {},
): ViewerPayload {
  const {
    enabled = true,
    previewViewers = 847,
    previewLive = true,
    pollIntervalSeconds,
  } = options;

  const pollIntervalMs = pollIntervalSeconds
    ? Math.max(10, pollIntervalSeconds) * 1000
    : DEFAULT_POLL_INTERVAL_MS;

  const [data, setData] = useState<ViewerPayload>({
    viewers: previewViewers,
    live: previewLive,
  });

  useEffect(() => {
    if (!enabled) return;

    if (previewMode) {
      setData({ viewers: previewViewers, live: previewLive });
      return;
    }

    let cancelled = false;

    async function fetchViewers() {
      try {
        const res = await fetch(
          `/api/widget/viewers/${userId}?token=${encodeURIComponent(token)}`,
        );
        if (!res.ok) return;
        const payload = (await res.json()) as ViewerPayload;
        if (!cancelled) setData(payload);
      } catch {
        /* ignore */
      }
    }

    void fetchViewers();
    const interval = window.setInterval(fetchViewers, pollIntervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [userId, token, previewMode, previewViewers, previewLive, enabled, pollIntervalMs]);

  return data;
}

interface ViewersWidgetProps {
  userId: string;
  token: string;
  position?: GoalOverlayPosition;
  dragPosition?: OverlayDragPoint | null;
  layout?: ViewersOverlayLayout;
  platforms?: ViewersPlatform[];
  themeColor?: string;
  previewMode?: boolean;
  previewViewers?: number;
  previewLive?: boolean;
}

export function ViewersWidget({
  userId,
  token,
  position = "top-left",
  dragPosition,
  layout = "classic",
  platforms = ["twitch"],
  themeColor = "#8b5cf6",
  previewMode = false,
  previewViewers = 847,
  previewLive = true,
}: ViewersWidgetProps) {
  const data = useViewerCount(userId, token, previewMode, {
    previewViewers,
    previewLive,
  });

  return (
    <div className={widgetShellClass(previewMode)}>
      <ViewersOverlay
        viewers={data.viewers}
        live={data.live}
        platformStats={data.platforms}
        layout={layout}
        platforms={platforms}
        position={position}
        dragPosition={dragPosition}
        themeColor={themeColor}
        embedded={previewMode}
      />
    </div>
  );
}
