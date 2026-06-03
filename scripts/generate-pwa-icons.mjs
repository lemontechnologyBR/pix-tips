import sharp from "sharp";
import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "public", "icons");

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const svg = fs.readFileSync(path.join(outDir, "app-icon.svg"));

  for (const size of [192, 512]) {
    await sharp(svg).resize(size, size).png().toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
