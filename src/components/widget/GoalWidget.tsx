"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { DonationPayload, GoalOverlayLayout, GoalOverlayPosition } from "@/types";
import { GoalOverlay } from "./GoalOverlay";

interface GoalWidgetProps {
  userId: string;
  token: string;
  goal?: number;
  raised?: number;
  goalTitle?: string;
  themeColor?: string;
  goalOverlayPosition?: GoalOverlayPosition;
  goalOverlayLayout?: GoalOverlayLayout;
  barColor?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  showPercentage?: boolean;
  showValues?: boolean;
  fontSize?: number;
  previewMode?: boolean;
}

interface GoalUpdatedPayload {
  goal: number;
  goalTitle?: string;
}

export function GoalWidget({
  userId,
  token,
  goal = 0,
  raised = 0,
  goalTitle = "Meta da live",
  themeColor = "#8b5cf6",
  goalOverlayPosition = "top-center",
  goalOverlayLayout = "classic",
  barColor = null,
  bgColor = null,
  textColor = null,
  showPercentage = true,
  showValues = true,
  fontSize = 14,
  previewMode = false,
}: GoalWidgetProps) {
  const [currentRaised, setCurrentRaised] = useState(raised);
  const [currentGoal, setCurrentGoal] = useState(goal);
  const [currentGoalTitle, setCurrentGoalTitle] = useState(goalTitle);

  useEffect(() => {
    setCurrentRaised(raised);
  }, [raised]);

  useEffect(() => {
    setCurrentGoal(goal);
  }, [goal]);

  useEffect(() => {
    setCurrentGoalTitle(goalTitle);
  }, [goalTitle]);

  useEffect(() => {
    if (previewMode) return;

    const socket: Socket = io("/alerts", {
      path: "/api/socket",
      auth: { userId, token },
    });

    socket.on("new-donation", (payload: DonationPayload) => {
      setCurrentRaised((prev) => prev + payload.amount);
    });

    socket.on("goal-updated", (payload: GoalUpdatedPayload) => {
      setCurrentGoal(payload.goal);
      if (payload.goalTitle !== undefined) {
        setCurrentGoalTitle(payload.goalTitle);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, token, previewMode]);

  return (
    <div
      className={
        previewMode
          ? "pointer-events-none absolute inset-0"
          : "pointer-events-none fixed inset-0 z-[9998]"
      }
    >
      <GoalOverlay
        raised={currentRaised}
        goal={currentGoal}
        goalTitle={currentGoalTitle}
        themeColor={themeColor}
        position={goalOverlayPosition}
        layout={goalOverlayLayout}
        barColor={barColor}
        bgColor={bgColor}
        textColor={textColor}
        showPercentage={showPercentage}
        showValues={showValues}
        fontSize={fontSize}
        embedded={previewMode}
        show
      />
    </div>
  );
}
