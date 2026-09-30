"use client";

import type { Creator, CreatorFanMissionPublic, CreatorSubPlan } from "@/types";
import { DonationForm } from "./DonationForm";
import { FanMissionsPanel } from "./FanMissionsPanel";
import { MonthlySupport } from "./MonthlySupport";
import { TipFanAuthBar } from "./TipFanAuthBar";
import { useTipFanSession } from "./TipFanSessionContext";

interface TipSupportStackProps {
  creator: Creator;
  layoutId: string;
  subPlans?: CreatorSubPlan[];
  missions?: CreatorFanMissionPublic[];
}

export function TipSupportStack({
  creator,
  layoutId,
  subPlans = [],
  missions = [],
}: TipSupportStackProps) {
  const { fan } = useTipFanSession();

  return (
    <div data-donation className="flex flex-col gap-6">
      <TipFanAuthBar
        returnTo={`/${creator.username}`}
        themeColor={creator.themeColor}
      />
      <DonationForm
        creator={creator}
        layoutId={layoutId}
        suggestedDonorName={fan?.name}
      />
      <MonthlySupport
        creatorId={creator.id}
        themeColor={creator.themeColor}
        plans={subPlans}
        suggestedName={fan?.name}
        suggestedEmail={fan?.email}
      />
      <FanMissionsPanel
        missions={missions}
        themeColor={creator.themeColor}
        loggedIn={Boolean(fan)}
      />
    </div>
  );
}
