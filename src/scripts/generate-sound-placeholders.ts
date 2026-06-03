/**
 * Generates short WAV placeholders in public/sounds/ for catalog sound IDs.
 * Each file encodes a simple tone pattern so previews differ per sound.
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";

type OscType = "sine" | "square" | "triangle" | "sawtooth";

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
  bell: [{ freq: 784, duration: 0.5, type: "sine", gain: 0.25 }],
  "bell-chord": [
    { freq: 523, duration: 0.3, gain: 0.15 },
    { freq: 659, duration: 0.3, gain: 0.15 },
    { freq: 784, duration: 0.4, gain: 0.2 },
  ],
  click: [{ freq: 1000, duration: 0.02, type: "square", gain: 0.1 }],
  "level-up": [
    { freq: 440, duration: 0.1, gain: 0.2 },
    { freq: 554, duration: 0.1, gain: 0.2 },
    { freq: 659, duration: 0.1, gain: 0.2 },
    { freq: 880, duration: 0.2, gain: 0.25 },
  ],
  combo: [
    { freq: 660, duration: 0.08, gain: 0.2 },
    { freq: 880, duration: 0.08, gain: 0.2 },
    { freq: 1100, duration: 0.12, gain: 0.25 },
  ],
  harp: [
    { freq: 440, duration: 0.08, gain: 0.12 },
    { freq: 554, duration: 0.08, gain: 0.12 },
    { freq: 659, duration: 0.08, gain: 0.12 },
    { freq: 880, duration: 0.15, gain: 0.15 },
  ],
  "water-drop": [{ freq: 1200, duration: 0.15, type: "sine", gain: 0.2 }],
  "wind-chime": [
    { freq: 880, duration: 0.2, gain: 0.1 },
    { freq: 1100, duration: 0.25, gain: 0.1 },
    { freq: 1320, duration: 0.3, gain: 0.08 },
  ],
};

const SAMPLE_RATE = 44100;

function oscSample(type: OscType, phase: number): number {
  const t = phase % 1;
  switch (type) {
    case "square":
      return t < 0.5 ? 1 : -1;
    case "triangle":
      return 1 - 4 * Math.abs(Math.round(t - 0.25) - (t - 0.25));
    case "sawtooth":
      return 2 * t - 1;
    default:
      return Math.sin(2 * Math.PI * phase);
  }
}

function synthesize(steps: ToneStep[]): Float32Array {
  const totalDuration = steps.reduce((sum, s) => sum + s.duration * 0.85, 0) + 0.05;
  const length = Math.ceil(totalDuration * SAMPLE_RATE);
  const samples = new Float32Array(length);

  let time = 0;
  for (const step of steps) {
    const startSample = Math.floor(time * SAMPLE_RATE);
    const stepSamples = Math.floor(step.duration * SAMPLE_RATE);
    const type = step.type ?? "sine";
    const gain = step.gain ?? 0.2;

    for (let i = 0; i < stepSamples; i++) {
      const idx = startSample + i;
      if (idx >= length) break;
      const phase = (step.freq * (i / SAMPLE_RATE)) % 1;
      const envelope = 1 - i / stepSamples;
      samples[idx] += oscSample(type, phase) * gain * envelope;
    }
    time += step.duration * 0.85;
  }

  for (let i = 0; i < length; i++) {
    samples[i] = Math.max(-1, Math.min(1, samples[i]));
  }
  return samples;
}

function encodeWav(samples: Float32Array): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (SAMPLE_RATE * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const val = Math.round(samples[i] * 32767);
    buffer.writeInt16LE(val, 44 + i * 2);
  }
  return buffer;
}

/** Minimal valid MPEG-1 Layer III frame (~417 bytes silent-ish tone). */
function encodeMinimalMp3(): Buffer {
  return Buffer.from([
    0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "sounds");
  await mkdir(outDir, { recursive: true });

  const ids = Object.keys(SOUND_PATTERNS);
  let wavCount = 0;
  let mp3Count = 0;

  for (const id of ids) {
    const steps = SOUND_PATTERNS[id];
    const wav = encodeWav(synthesize(steps));
    await writeFile(path.join(outDir, `${id}.wav`), wav);
    wavCount += 1;

    const mp3 = encodeMinimalMp3();
    await writeFile(path.join(outDir, `${id}.mp3`), mp3);
    mp3Count += 1;
  }

  console.log(`Generated ${wavCount} WAV and ${mp3Count} MP3 files in public/sounds/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
