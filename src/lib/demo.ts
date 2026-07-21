export const DEMO_USERNAME = "demo";
export const DEMO_CREATOR_ID = "creator-demo-001";
export const DEMO_EMAIL = "demo@pix.tips";
export const DEMO_WIDGET_TOKEN = "demo-widget-token-abc123";

export function isDemoCreator(creatorId: string, username?: string | null): boolean {
  return creatorId === DEMO_CREATOR_ID || username === DEMO_USERNAME;
}
