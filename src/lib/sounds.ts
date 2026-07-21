"use client";

import { DEFAULT_ALERT_SOUND_ID, getSoundById } from "@/lib/alert-catalog";

type OscType = OscillatorType;

interface ToneStep {
  freq: number;
  duration: number;
  type?: OscType;
  gain?: number;
}

const SOUND_PATTERNS: Record<string, ToneStep[]> = {
  ding: [{ freq: 880, duration: 0.15, type: "sine", gain: 0.3 }],
  "double-ding": [
    { freq: 880, duration: 0.1, type: "sine", gain: 0.25 },
    { freq: 1100, duration: 0.15, type: "sine", gain: 0.25 },
  ],
  chime: [
    { freq: 523, duration: 0.12, gain: 0.2 },
    { freq: 659, duration: 0.12, gain: 0.2 },
    { freq: 784, duration: 0.2, gain: 0.25 },
  ],
  twinkle: [
    { freq: 1200, duration: 0.08, gain: 0.15 },
    { freq: 1600, duration: 0.08, gain: 0.15 },
    { freq: 2000, duration: 0.12, gain: 0.15 },
  ],
  sparkle: [{ freq: 2400, duration: 0.05, type: "square", gain: 0.08 }],
  pop: [{ freq: 200, duration: 0.08, type: "triangle", gain: 0.35 }],
  swoosh: [{ freq: 400, duration: 0.3, type: "sawtooth", gain: 0.06 }],
  "coin-collect": [
    { freq: 987, duration: 0.06, gain: 0.2 },
    { freq: 1318, duration: 0.12, gain: 0.2 },
  ],
  powerup: [
    { freq: 300, duration: 0.1, gain: 0.15 },
    { freq: 600, duration: 0.1, gain: 0.15 },
    { freq: 900, duration: 0.15, gain: 0.2 },
  ],
  achievement: [
    { freq: 523, duration: 0.15, gain: 0.2 },
    { freq: 659, duration: 0.15, gain: 0.2 },
    { freq: 784, duration: 0.25, gain: 0.25 },
  ],
  boing: [
    { freq: 150, duration: 0.1, gain: 0.3 },
    { freq: 400, duration: 0.15, gain: 0.25 },
    { freq: 200, duration: 0.1, gain: 0.2 },
  ],
  bonk: [{ freq: 80, duration: 0.12, type: "square", gain: 0.25 }],
  "glitch-sound": [
    { freq: 200, duration: 0.04, type: "square", gain: 0.1 },
    { freq: 800, duration: 0.04, type: "sawtooth", gain: 0.1 },
    { freq: 400, duration: 0.04, type: "square", gain: 0.1 },
  ],
  "synth-wave": [{ freq: 220, duration: 0.4, type: "sawtooth", gain: 0.08 }],
  notification: [{ freq: 660, duration: 0.2, type: "sine", gain: 0.2 }],
  "robot-beep": [{ freq: 440, duration: 0.1, type: "square", gain: 0.12 }],
  scanner: [{ freq: 800, duration: 0.5, type: "sine", gain: 0.06 }],
  teleport: [
    { freq: 1000, duration: 0.15, gain: 0.1 },
    { freq: 500, duration: 0.2, gain: 0.1 },
  ],
  "typewriter-key": [{ freq: 1200, duration: 0.03, type: "square", gain: 0.15 }],
  thunder: [{ freq: 60, duration: 0.8, type: "sawtooth", gain: 0.15 }],
  "orchestra-hit": [
    { freq: 130, duration: 0.1, gain: 0.2 },
    { freq: 260, duration: 0.2, gain: 0.15 },
  ],
  "camera-shutter": [{ freq: 1800, duration: 0.05, gain: 0.1 }],
};

let audioCtx: AudioContext | null = null;
let widgetAudioUnlocked = false;
const audioCache = new Map<string, HTMLAudioElement>();
const pendingPlays: Array<() => Promise<void>> = [];

function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function isWidgetAudioUnlocked() {
  return widgetAudioUnlocked;
}

async function resumeAudioContext(): Promise<boolean> {
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    if (ctx.state !== "running") {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
    return ctx.state === "running";
  } catch {
    return false;
  }
}

async function flushPendingPlays() {
  if (!widgetAudioUnlocked || pendingPlays.length === 0) return;
  const queue = pendingPlays.splice(0, pendingPlays.length);
  for (const play of queue) {
    await play();
  }
}

/** Desbloqueia áudio no widget OBS (requer gesto do usuário se o navegador bloquear). */
export async function unlockWidgetAudio(): Promise<boolean> {
  const ctxOk = await resumeAudioContext();

  try {
    const probe = getAudioElement(`/sounds/ncs/${DEFAULT_ALERT_SOUND_ID}.mp3`);
    probe.volume = 0.001;
    await probe.play();
    probe.pause();
    probe.currentTime = 0;
    probe.volume = 1;
    widgetAudioUnlocked = true;
  } catch {
    widgetAudioUnlocked = ctxOk;
  }

  await flushPendingPlays();
  return widgetAudioUnlocked;
}

function getAudioElement(url: string): HTMLAudioElement {
  let audio = audioCache.get(url);
  if (!audio) {
    audio = new Audio(url);
    audio.preload = "auto";
    audioCache.set(url, audio);
  }
  audio.currentTime = 0;
  return audio;
}

function playTone(steps: ToneStep[]) {
  const ctx = getCtx();
  let time = ctx.currentTime;
  for (const step of steps) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = step.type ?? "sine";
    osc.frequency.value = step.freq;
    gain.gain.value = step.gain ?? 0.2;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + step.duration);
    time += step.duration * 0.85;
  }
}

async function playSynthetic(soundId: string) {
  await resumeAudioContext();
  const pattern = SOUND_PATTERNS[soundId];
  if (pattern) {
    playTone(pattern);
    return;
  }
  const meta = getSoundById(soundId);
  if (meta) playTone([{ freq: 660, duration: meta.duration * 0.3, gain: 0.15 }]);
}

async function tryPlayFile(url: string): Promise<boolean> {
  try {
    await resumeAudioContext();
    const audio = getAudioElement(url);
    audio.volume = 1;
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

export async function playCustomSound(url: string) {
  await tryPlayFile(url);
}

function catalogSoundUrls(soundId: string): string[] {
  const meta = getSoundById(soundId);
  const urls = [
    meta?.file,
    `/sounds/ncs/${soundId}.mp3`,
    `/sounds/npc/${soundId}.mp3`,
    `/sounds/${soundId}.mp3`,
    `/sounds/${soundId}.wav`,
    `/sounds/${soundId}.ogg`,
  ].filter((url): url is string => Boolean(url));

  return [...new Set(urls)];
}

async function playCatalogSoundInternal(
  soundId: string | null,
  customUrl?: string | null,
) {
  if (customUrl) {
    await playCustomSound(customUrl);
    return;
  }
  if (!soundId && !customUrl) {
    soundId = DEFAULT_ALERT_SOUND_ID;
  }
  if (!soundId) return;

  for (const url of catalogSoundUrls(soundId)) {
    if (await tryPlayFile(url)) return;
  }

  await playSynthetic(soundId);
}

/**
 * Executa `run` imediatamente se o áudio do widget já está desbloqueado;
 * caso contrário, enfileira para tocar assim que o usuário desbloquear.
 */
export async function runWhenAudioUnlocked(run: () => Promise<void>): Promise<void> {
  if (!widgetAudioUnlocked) {
    const unlocked = await unlockWidgetAudio();
    if (!unlocked) {
      pendingPlays.push(run);
      return;
    }
  }

  await run();
}

export async function playCatalogSound(
  soundId: string | null,
  customUrl?: string | null,
) {
  await runWhenAudioUnlocked(() => playCatalogSoundInternal(soundId, customUrl));
}

export function preloadCatalogSound(soundId: string = DEFAULT_ALERT_SOUND_ID) {
  for (const url of catalogSoundUrls(soundId)) {
    if (!audioCache.has(url)) {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.load();
      audioCache.set(url, audio);
    }
  }
}
