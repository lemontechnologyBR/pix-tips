"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { playCatalogSound } from "@/lib/sounds";
import { addDonationToLeaderboard, buildLeaderboardFromItems } from "@/lib/leaderboard";
import { resolveDragPoint } from "@/lib/overlay-drag-position";
import type {
  AlertSettings,
  DonationPayload,
  GoalOverlayLayout,
  GoalOverlayPosition,
  LeaderboardEntry,
  OverlayWidgetSettings,
  TextConfig,
  WidgetDonationItem,
} from "@/types";
import { DEFAULT_TEXT_CONFIG } from "@/types";
import { AlertRenderer } from "./AlertRenderer";
import { GoalOverlay } from "./GoalOverlay";
import { LastDonationOverlay } from "./LastDonationOverlay";
import { LeaderboardOverlay } from "./LeaderboardOverlay";
import { StatsOverlay } from "./StatsOverlay";
import { SupportersOverlay } from "./SupportersOverlay";
import { TickerOverlay } from "./TickerOverlay";
import { ViewersOverlay } from "./ViewersOverlay";
import { useViewerCount } from "./ViewersWidget";
import { WidgetAudioUnlock } from "./WidgetAudioUnlock";
import {
  donationToWidgetItem,
  useDonationSocket,
  widgetShellClass,
} from "./useDonationSocket";

interface UnifiedOverlayWidgetProps {
  userId: string;
  token: string;
  goal: number;
  raised: number;
  goalTitle: string;
  themeColor: string;
  alertSettings: AlertSettings;
  initialItems?: WidgetDonationItem[];
  previewMode?: boolean;
}

interface AlertState {
  queue: DonationPayload[];
  current: DonationPayload | null;
}

type AlertAction =
  | { type: "ENQUEUE"; payload: DonationPayload }
  | { type: "COMPLETE" };

function alertReducer(state: AlertState, action: AlertAction): AlertState {
  switch (action.type) {
    case "ENQUEUE": {
      if (state.current) {
        return { ...state, queue: [...state.queue, action.payload] };
      }
      return { ...state, current: action.payload };
    }
    case "COMPLETE": {
      if (state.queue.length === 0) {
        return { ...state, current: null };
      }
      const [next, ...rest] = state.queue;
      return { current: next, queue: rest };
    }
    default:
      return state;
  }
}

export function UnifiedOverlayWidget({
  userId,
  token,
  goal,
  raised,
  goalTitle,
  themeColor,
  alertSettings,
  initialItems = [],
  previewMode = false,
}: UnifiedOverlayWidgetProps) {
  const widgets = alertSettings.overlayWidgets;
  const [currentRaised, setCurrentRaised] = useState(raised);
  const [tickerItems, setTickerItems] = useState<WidgetDonationItem[]>(initialItems);
  const [supporterItems, setSupporterItems] = useState<WidgetDonationItem[]>(initialItems);
  const [lastItem, setLastItem] = useState<WidgetDonationItem | null>(
    initialItems[0] ?? null,
  );
  const [lastPulse, setLastPulse] = useState(false);
  const [statsCount, setStatsCount] = useState(0);
  const [statsTotal, setStatsTotal] = useState(0);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>(() =>
    buildLeaderboardFromItems(initialItems).slice(
      0,
      alertSettings.leaderboardMaxItems,
    ),
  );

  const [alertState, dispatchAlert] = useReducer(alertReducer, {
    queue: [],
    current: null,
  });

  useEffect(() => {
    setCurrentRaised(raised);
  }, [raised]);

  useEffect(() => {
    setTickerItems(initialItems);
    setSupporterItems(initialItems);
    setLastItem(initialItems[0] ?? null);
    setLeaderboardEntries(
      buildLeaderboardFromItems(initialItems).slice(
        0,
        alertSettings.leaderboardMaxItems,
      ),
    );
  }, [initialItems, alertSettings.leaderboardMaxItems]);

  const onDonation = useCallback(
    (payload: DonationPayload) => {
      if (widgets.alerts) {
        dispatchAlert({ type: "ENQUEUE", payload });
      }
      if (widgets.goal) {
        setCurrentRaised((prev) => prev + payload.amount);
      }
      if (widgets.ticker) {
        setTickerItems((prev) =>
          [donationToWidgetItem(payload), ...prev].slice(
            0,
            alertSettings.tickerMaxItems,
          ),
        );
      }
      if (widgets.supporters) {
        setSupporterItems((prev) =>
          [donationToWidgetItem(payload), ...prev].slice(
            0,
            alertSettings.supportersMaxItems,
          ),
        );
      }
      if (widgets.lastDonation) {
        setLastItem(donationToWidgetItem(payload));
        setLastPulse(true);
        window.setTimeout(() => setLastPulse(false), 500);
      }
      if (widgets.stats) {
        setStatsCount((c) => c + 1);
        setStatsTotal((t) => t + payload.amount);
      }
      if (widgets.leaderboard) {
        setLeaderboardEntries((prev) =>
          addDonationToLeaderboard(prev, payload).slice(
            0,
            alertSettings.leaderboardMaxItems,
          ),
        );
      }
    },
    [widgets, alertSettings],
  );

  useDonationSocket(userId, token, previewMode, onDonation);

  const currentAlert = alertState.current;
  const alertKey = currentAlert
    ? `${currentAlert.name}:${currentAlert.amount}:${currentAlert.templateId}`
    : null;

  useEffect(() => {
    if (!currentAlert) return;
    void playCatalogSound(currentAlert.soundId, currentAlert.soundUrl);
  }, [alertKey, currentAlert]);

  useEffect(() => {
    if (!previewMode) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<DonationPayload>).detail;
      if (detail) onDonation(detail);
    };
    window.addEventListener("widget-test-alert", handler);
    return () => window.removeEventListener("widget-test-alert", handler);
  }, [previewMode, onDonation]);

  const textConfig: TextConfig = alertSettings.textConfig ?? DEFAULT_TEXT_CONFIG;
  const showGoal = widgets.goal && goal > 0;
  const drag = alertSettings.overlayDragPositions;
  const viewerData = useViewerCount(userId, token, previewMode, {
    enabled: widgets.viewers,
    previewViewers: 1247,
    previewLive: true,
    pollIntervalSeconds: alertSettings.viewersPollInterval,
  });

  const overlayScale = alertSettings.overlayScale ?? 1;
  const overlayOpacity = alertSettings.overlayOpacity ?? 1;

  return (
    <div className={widgetShellClass(previewMode)}>
      <div
        style={{
          transform: `scale(${overlayScale})`,
          opacity: overlayOpacity,
          transformOrigin: "top left",
        }}
        className="absolute inset-0"
      >
      {showGoal && (
        <GoalOverlay
          raised={currentRaised}
          goal={goal}
          goalTitle={goalTitle}
          themeColor={themeColor}
          position={alertSettings.goalOverlayPosition}
          dragPosition={resolveDragPoint(drag, "goal", alertSettings.goalOverlayPosition)}
          layout={alertSettings.goalOverlayLayout}
          barColor={alertSettings.goalBarColor}
          bgColor={alertSettings.goalBgColor}
          textColor={alertSettings.goalTextColor}
          showPercentage={alertSettings.goalShowPercentage}
          showValues={alertSettings.goalShowValues}
          fontSize={alertSettings.goalFontSize}
          embedded={previewMode}
          show
        />
      )}

      {widgets.ticker && (
        <TickerOverlay
          items={tickerItems}
          position={alertSettings.tickerPosition}
          dragPosition={resolveDragPoint(drag, "ticker", alertSettings.tickerPosition)}
          layout={alertSettings.tickerLayout}
          themeColor={themeColor}
          embedded={previewMode}
          speed={alertSettings.tickerSpeed}
          bgColor={alertSettings.tickerBgColor}
          textColor={alertSettings.tickerTextColor}
          fontSize={alertSettings.tickerFontSize}
        />
      )}

      {widgets.stats && (
        <StatsOverlay
          count={statsCount}
          total={statsTotal}
          position={alertSettings.statsPosition}
          dragPosition={resolveDragPoint(drag, "stats", alertSettings.statsPosition)}
          themeColor={themeColor}
          layout={alertSettings.statsLayout}
          label={alertSettings.statsLabel}
          countLabel={alertSettings.statsCountLabel}
          bgColor={alertSettings.statsBgColor}
          textColor={alertSettings.statsTextColor}
          fontSize={alertSettings.statsFontSize}
          embedded={previewMode}
        />
      )}

      {widgets.lastDonation && (
        <LastDonationOverlay
          item={lastItem}
          position={alertSettings.lastDonationPosition}
          dragPosition={resolveDragPoint(
            drag,
            "lastDonation",
            alertSettings.lastDonationPosition,
          )}
          themeColor={themeColor}
          layout={alertSettings.lastDonationLayout}
          bgColor={alertSettings.lastDonationBgColor}
          textColor={alertSettings.lastDonationTextColor}
          fontSize={alertSettings.lastDonationFontSize}
          embedded={previewMode}
          pulse={lastPulse}
        />
      )}

      {widgets.supporters && (
        <SupportersOverlay
          items={supporterItems}
          position={alertSettings.supportersPosition}
          dragPosition={resolveDragPoint(
            drag,
            "supporters",
            alertSettings.supportersPosition,
          )}
          themeColor={themeColor}
          embedded={previewMode}
          title={alertSettings.supportersTitle}
          layout={alertSettings.supportersLayout}
          bgColor={alertSettings.supportersBgColor}
          textColor={alertSettings.supportersTextColor}
          fontSize={alertSettings.supportersFontSize}
        />
      )}

      {widgets.leaderboard && (
        <LeaderboardOverlay
          entries={leaderboardEntries}
          position={alertSettings.leaderboardPosition}
          dragPosition={resolveDragPoint(
            drag,
            "leaderboard",
            alertSettings.leaderboardPosition,
          )}
          themeColor={themeColor}
          embedded={previewMode}
          title={alertSettings.leaderboardTitle}
          period={alertSettings.leaderboardPeriod}
          bgColor={alertSettings.leaderboardBgColor}
          textColor={alertSettings.leaderboardTextColor}
          fontSize={alertSettings.leaderboardFontSize}
        />
      )}

      {widgets.viewers && (
        <ViewersOverlay
          viewers={viewerData.viewers}
          live={viewerData.live}
          layout={alertSettings.viewersLayout}
          platforms={alertSettings.viewersPlatforms}
          position={alertSettings.viewersPosition}
          dragPosition={resolveDragPoint(
            drag,
            "viewers",
            alertSettings.viewersPosition,
          )}
          themeColor={themeColor}
          embedded={previewMode}
          label={alertSettings.viewersLabel || undefined}
          hideOffline={alertSettings.viewersHideOffline}
          bgColor={alertSettings.viewersBgColor}
          textColor={alertSettings.viewersTextColor}
        />
      )}

      {widgets.alerts && currentAlert && (
        <div className="pointer-events-none absolute inset-0 z-[10000]">
          <AlertRenderer
            alert={currentAlert}
            duration={alertSettings.duration}
            textTemplate={alertSettings.textTemplate}
            textConfig={textConfig}
            onComplete={() => dispatchAlert({ type: "COMPLETE" })}
            contained={previewMode}
          />
        </div>
      )}
      </div>

      {!previewMode && widgets.alerts && <WidgetAudioUnlock />}
    </div>
  );
}

export type {
  GoalOverlayLayout,
  GoalOverlayPosition,
  OverlayWidgetSettings,
};
