import type { ViewersPlatform } from "@/types";

export interface ViewerPlatformResult {
  viewers: number;
  live: boolean;
  channel: string | null;
  mock?: boolean;
}

export type ViewerPlatformMap = Partial<Record<ViewersPlatform, ViewerPlatformResult>>;

export interface ViewersApiPayload {
  platforms: ViewerPlatformMap;
  viewers: number;
  live: boolean;
  channel: string | null;
  mock?: boolean;
}
