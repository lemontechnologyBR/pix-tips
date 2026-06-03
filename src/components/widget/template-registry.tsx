"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { AlertTemplateId } from "@/types";
import type { AlertTemplateProps } from "./templates/types";
import { normalizeTemplateId } from "@/lib/alert-catalog";

const load = () => import("./templates/TemplateCatalog");

function lazyNamed(name: string) {
  return dynamic(
    () =>
      load().then((mod) => {
        const Comp = (mod as Record<string, ComponentType<AlertTemplateProps>>)[name];
        if (!Comp) throw new Error(`Template ${name} not found`);
        return Comp;
      }),
    { ssr: false },
  );
}

const SlideUp = lazyNamed("TemplateSlideUp");
const SlideDown = lazyNamed("TemplateSlideDown");
const SlideLeft = lazyNamed("TemplateSlideLeft");
const SlideRight = lazyNamed("TemplateSlideRight");
const FadeIn = lazyNamed("TemplateFadeIn");
const ZoomBounce = lazyNamed("TemplateZoomBounce");
const Confetti = lazyNamed("TemplateConfetti");
const EmojiRain = lazyNamed("TemplateEmojiRain");
const Coins = lazyNamed("TemplateCoins");
const Stars = lazyNamed("TemplateStars");
const Fireworks = lazyNamed("TemplateFireworks");
const Typewriter = lazyNamed("TemplateTypewriter");
const Glitch = lazyNamed("TemplateGlitch");
const Neon = lazyNamed("TemplateNeon");
const Marquee = lazyNamed("TemplateMarquee");
const SplitFlap = lazyNamed("TemplateSplitFlap");
const MascotEnter = lazyNamed("TemplateMascotEnter");
const PetCompanion = lazyNamed("TemplatePetCompanion");
const GhostReveal = lazyNamed("TemplateGhostReveal");
const GameAchievement = lazyNamed("TemplateGameAchievement");
const ChatBubble = lazyNamed("TemplateChatBubble");
const Spotlight = lazyNamed("TemplateSpotlight");
const StageCurtain = lazyNamed("TemplateStageCurtain");
const Polaroid = lazyNamed("TemplatePolaroid");
const Dot = lazyNamed("TemplateDot");
const Line = lazyNamed("TemplateLine");
const CornerBadge = lazyNamed("TemplateCornerBadge");
const Earthquake = lazyNamed("TemplateEarthquake");
const Roulette = lazyNamed("TemplateRoulette");
const KickAlert = lazyNamed("TemplateKickAlert");
const Portal = lazyNamed("TemplatePortal");
const Default = lazyNamed("TemplateDefault");

export function AlertTemplateSwitch({
  templateId,
  ...props
}: AlertTemplateProps & { templateId: AlertTemplateId }) {
  switch (normalizeTemplateId(templateId)) {
    case "slide-up":
      return <SlideUp {...props} />;
    case "slide-down":
      return <SlideDown {...props} />;
    case "slide-left":
      return <SlideLeft {...props} />;
    case "slide-right":
      return <SlideRight {...props} />;
    case "fade-in":
      return <FadeIn {...props} />;
    case "zoom-bounce":
      return <ZoomBounce {...props} />;
    case "confetti":
      return <Confetti {...props} />;
    case "emoji-rain":
      return <EmojiRain {...props} />;
    case "coins":
      return <Coins {...props} />;
    case "stars":
      return <Stars {...props} />;
    case "fireworks":
      return <Fireworks {...props} />;
    case "typewriter":
      return <Typewriter {...props} />;
    case "glitch":
    case "gif":
      return <Glitch {...props} />;
    case "neon":
    case "heart-pulse":
    case "neon-border":
      return <Neon {...props} />;
    case "marquee":
      return <Marquee {...props} />;
    case "split-flap":
      return <SplitFlap {...props} />;
    case "mascot-enter":
      return <MascotEnter {...props} />;
    case "pet-companion":
      return <PetCompanion {...props} />;
    case "ghost-reveal":
      return <GhostReveal {...props} />;
    case "game-achievement":
      return <GameAchievement {...props} />;
    case "chat-bubble":
      return <ChatBubble {...props} />;
    case "spotlight":
      return <Spotlight {...props} />;
    case "stage-curtain":
      return <StageCurtain {...props} />;
    case "polaroid":
      return <Polaroid {...props} />;
    case "dot":
      return <Dot {...props} />;
    case "line":
      return <Line {...props} />;
    case "corner-badge":
      return <CornerBadge {...props} />;
    case "earthquake":
      return <Earthquake {...props} />;
    case "roulette":
      return <Roulette {...props} />;
    case "kick-alert":
      return <KickAlert {...props} />;
    case "portal":
      return <Portal {...props} />;
    default:
      return <Default {...props} />;
  }
}
