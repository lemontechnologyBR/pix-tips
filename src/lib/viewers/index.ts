import { getKickViewersForCreator } from "@/lib/kick/viewers";
import { getTwitchViewersForCreator } from "@/lib/twitch/viewers";
import type { ViewersPlatform } from "@/types";
import type { ViewerPlatformResult, ViewersApiPayload } from "./types";

const OFFLINE: ViewerPlatformResult = { viewers: 0, live: false, channel: null };

async function getPlatformViewers(
  platform: ViewersPlatform,
  creatorId: string,
): Promise<ViewerPlatformResult> {
  if (platform === "twitch") {
    return getTwitchViewersForCreator(creatorId);
  }
  if (platform === "kick") {
    return getKickViewersForCreator(creatorId);
  }
  return OFFLINE;
}

function pickLegacyPlatform(
  platforms: ViewersPlatform[],
  results: Partial<Record<ViewersPlatform, ViewerPlatformResult>>,
): ViewerPlatformResult {
  for (const platform of platforms) {
    const result = results[platform];
    if (result?.live) return result;
  }
  return results[platforms[0] ?? "twitch"] ?? OFFLINE;
}

export async function getViewersForCreator(
  creatorId: string,
  platforms: ViewersPlatform[] = ["twitch"],
): Promise<ViewersApiPayload> {
  const uniquePlatforms = [...new Set(platforms.length > 0 ? platforms : (["twitch"] as ViewersPlatform[]))];

  const entries = await Promise.all(
    uniquePlatforms.map(async (platform) => [platform, await getPlatformViewers(platform, creatorId)] as const),
  );

  const platformMap = Object.fromEntries(entries) as Partial<
    Record<ViewersPlatform, ViewerPlatformResult>
  >;
  const legacy = pickLegacyPlatform(uniquePlatforms, platformMap);

  return {
    platforms: platformMap,
    viewers: legacy.viewers,
    live: legacy.live,
    channel: legacy.channel,
    mock: legacy.mock,
  };
}
