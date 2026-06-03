/**
 * Baixa efeitos Mixkit (sem copyright) e gera MP3s em public/sounds/ncs/.
 * Requer ffmpeg no PATH.
 */
import { mkdir, writeFile } from "fs/promises";
import { execSync } from "child_process";
import path from "path";
import os from "os";

const MIXKIT_SOUNDS: Record<string, number> = {
  "ncs-correct": 2870,
  "ncs-pop": 2358,
  "ncs-bell": 933,
  "ncs-scifi": 900,
  "ncs-message": 2354,
  "ncs-happy": 937,
  "ncs-interface": 2574,
  "ncs-coin": 2069,
  "ncs-level": 2059,
  "ncs-arcade": 211,
  "ncs-unlock": 253,
  "ncs-bonus": 2058,
  "ncs-positive": 265,
  "ncs-bling": 2067,
};

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit" });
}

async function download(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${url} (${res.status})`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const tmp = path.join(os.tmpdir(), "tip-page-ncs-sounds");
  const outDir = path.join(process.cwd(), "public", "sounds", "ncs");
  await mkdir(tmp, { recursive: true });
  await mkdir(outDir, { recursive: true });

  for (const [id, mixkitId] of Object.entries(MIXKIT_SOUNDS)) {
    const output = path.join(outDir, `${id}.mp3`);
    const wav = path.join(tmp, `${mixkitId}.wav`);
    const wavUrl = `https://assets.mixkit.co/active_storage/sfx/${mixkitId}/${mixkitId}.wav`;
    const previewUrl = `https://assets.mixkit.co/active_storage/sfx/${mixkitId}/${mixkitId}-preview.mp3`;

    try {
      await download(wavUrl, wav);
      run(`ffmpeg -y -i "${wav}" -codec:a libmp3lame -qscale:a 2 "${output}"`);
    } catch {
      console.warn(`WAV unavailable for ${id}, using preview MP3`);
      await download(previewUrl, output);
    }
  }

  console.log(`Done — ${Object.keys(MIXKIT_SOUNDS).length} MP3s in public/sounds/ncs/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
