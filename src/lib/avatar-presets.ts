export type AvatarStyle =
  | "avataaars"
  | "bottts"
  | "fun-emoji"
  | "lorelei"
  | "pixel-art"
  | "adventurer"
  | "big-smile"
  | "thumbs";

export interface AvatarPreset {
  id: string;
  label: string;
  style: AvatarStyle;
  seed: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "streamer-1", label: "Streamer", style: "avataaars", seed: "streamer1" },
  { id: "streamer-2", label: "Gamer", style: "avataaars", seed: "gamer42" },
  { id: "streamer-3", label: "Criador", style: "avataaars", seed: "creator99" },
  { id: "streamer-4", label: "Live", style: "avataaars", seed: "live2026" },
  { id: "streamer-5", label: "Pro", style: "avataaars", seed: "pro-player" },
  { id: "streamer-6", label: "Chat", style: "avataaars", seed: "chat-mod" },
  { id: "adv-1", label: "Aventureiro", style: "adventurer", seed: "quest1" },
  { id: "adv-2", label: "Explorador", style: "adventurer", seed: "explorer" },
  { id: "adv-3", label: "Herói", style: "adventurer", seed: "hero-x" },
  { id: "adv-4", label: "Ranger", style: "adventurer", seed: "ranger" },
  { id: "bot-1", label: "Robô", style: "bottts", seed: "bot-alpha" },
  { id: "bot-2", label: "Bot", style: "bottts", seed: "bot-beta" },
  { id: "bot-3", label: "Cyborg", style: "bottts", seed: "cyborg" },
  { id: "bot-4", label: "Droid", style: "bottts", seed: "droid-7" },
  { id: "emoji-1", label: "Fogo", style: "fun-emoji", seed: "fire" },
  { id: "emoji-2", label: "Estrela", style: "fun-emoji", seed: "star" },
  { id: "emoji-3", label: "Raio", style: "fun-emoji", seed: "zap" },
  { id: "emoji-4", label: "Coração", style: "fun-emoji", seed: "heart" },
  { id: "emoji-5", label: "Party", style: "fun-emoji", seed: "party" },
  { id: "emoji-6", label: "Cool", style: "fun-emoji", seed: "cool" },
  { id: "lorelei-1", label: "Artista", style: "lorelei", seed: "artist" },
  { id: "lorelei-2", label: "Música", style: "lorelei", seed: "music" },
  { id: "lorelei-3", label: "DJ", style: "lorelei", seed: "dj-live" },
  { id: "lorelei-4", label: "Podcast", style: "lorelei", seed: "podcast" },
  { id: "pixel-1", label: "Pixel", style: "pixel-art", seed: "pixel1" },
  { id: "pixel-2", label: "Retro", style: "pixel-art", seed: "retro8" },
  { id: "pixel-3", label: "Arcade", style: "pixel-art", seed: "arcade" },
  { id: "smile-1", label: "Sorriso", style: "big-smile", seed: "happy" },
  { id: "smile-2", label: "Vibes", style: "big-smile", seed: "vibes" },
  { id: "thumb-1", label: "Like", style: "thumbs", seed: "like" },
  { id: "thumb-2", label: "Top", style: "thumbs", seed: "top-donor" },
];

export function avatarUrlFromPreset(preset: AvatarPreset): string {
  return `https://api.dicebear.com/7.x/${preset.style}/svg?seed=${encodeURIComponent(preset.seed)}`;
}

export function avatarUrlFromSeed(
  seed: string,
  style: AvatarStyle = "avataaars",
): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export function findPresetByUrl(url: string): AvatarPreset | undefined {
  return AVATAR_PRESETS.find((p) => avatarUrlFromPreset(p) === url);
}
