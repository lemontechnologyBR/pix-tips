import QRCode from "qrcode";
import type { QRCode as QrMatrix } from "qrcode";
import {
  isQrCenterAvatar,
  resolveQrCenterImageUrl,
} from "@/lib/qr-brand-logo";
import type { PlanType, QrCodeSettings } from "@/types";

export interface QrCardRenderInput {
  pageUrl: string;
  settings: QrCodeSettings;
  avatarUrl?: string;
  plan?: PlanType;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function isFinderModule(row: number, col: number, count: number): boolean {
  if (row < 7 && col < 7) return true;
  if (row < 7 && col >= count - 7) return true;
  if (row >= count - 7 && col < 7) return true;
  return false;
}

function drawFinderPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cell: number,
  dark: string,
  light: string,
) {
  const s = cell * 7;
  const r = cell * 1.4;

  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.roundRect(x, y, s, s, r);
  ctx.fill();

  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.roundRect(x + cell, y + cell, s - cell * 2, s - cell * 2, r * 0.65);
  ctx.fill();

  ctx.fillStyle = dark;
  const inner = cell * 3;
  const ix = x + cell * 2;
  const iy = y + cell * 2;
  ctx.beginPath();
  ctx.roundRect(ix, iy, inner, inner, r * 0.45);
  ctx.fill();
}

interface CenterSkip {
  halfW: number;
  halfH: number;
}

function isInCenterSkip(
  px: number,
  py: number,
  size: number,
  skip?: CenterSkip,
): boolean {
  if (!skip) return false;
  const cx = size / 2;
  const cy = size / 2;
  return Math.abs(px - cx) < skip.halfW && Math.abs(py - cy) < skip.halfH;
}

function drawStyledQrModules(
  ctx: CanvasRenderingContext2D,
  matrix: QrMatrix,
  size: number,
  marginModules: number,
  dark: string,
  light: string,
  centerSkip?: CenterSkip,
) {
  const count = matrix.modules.size;
  const total = count + marginModules * 2;
  const cell = size / total;
  const marginPx = marginModules * cell;
  const dotR = cell * 0.42;

  ctx.fillStyle = light;
  ctx.fillRect(0, 0, size, size);

  const positions: [number, number][] = [
    [0, 0],
    [0, count - 7],
    [count - 7, 0],
  ];
  for (const [row, col] of positions) {
    drawFinderPattern(
      ctx,
      marginPx + col * cell,
      marginPx + row * cell,
      cell,
      dark,
      light,
    );
  }

  ctx.fillStyle = dark;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (isFinderModule(row, col, count)) continue;
      if (!matrix.modules.get(row, col)) continue;

      const px = marginPx + col * cell + cell / 2;
      const py = marginPx + row * cell + cell / 2;
      if (isInCenterSkip(px, py, size, centerSkip)) continue;

      ctx.beginPath();
      ctx.arc(px, py, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const BRAND_LOGO_HEIGHT_RATIO = 0.14;
const BRAND_LOGO_ASPECT = 108 / 34;

function brandLogoSize(size: number, aspect = BRAND_LOGO_ASPECT) {
  const logoH = size * BRAND_LOGO_HEIGHT_RATIO;
  return { logoH, logoW: logoH * aspect };
}

function centerSkipForBrandLogo(size: number): CenterSkip {
  const { logoH, logoW } = brandLogoSize(size);
  const padX = size * 0.006;
  const padY = size * 0.012;
  return { halfW: logoW / 2 + padX, halfH: logoH / 2 + padY };
}

function centerSkipForAvatar(size: number): CenterSkip {
  const r = size * 0.105 + 4;
  return { halfW: r, halfH: r };
}

async function drawCenterBrandLogo(
  ctx: CanvasRenderingContext2D,
  size: number,
  centerSrc: string,
) {
  const centerImg = await loadImage(centerSrc);
  const aspect =
    centerImg.naturalWidth > 0
      ? centerImg.naturalWidth / centerImg.naturalHeight
      : BRAND_LOGO_ASPECT;
  const { logoH, logoW } = brandLogoSize(size, aspect);
  const cx = size / 2;
  const cy = size / 2;

  ctx.drawImage(centerImg, cx - logoW / 2, cy - logoH / 2, logoW, logoH);
}

async function drawCenterAvatar(
  ctx: CanvasRenderingContext2D,
  size: number,
  avatarUrl: string,
  accent: string,
) {
  const avatar = await loadImage(avatarUrl);
  const r = size * 0.105;
  const cx = size / 2;
  const cy = size / 2;

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

export async function generateQrDataUrl(
  url: string,
  settings: QrCodeSettings,
  options?: { avatarUrl?: string; plan?: PlanType },
): Promise<string> {
  const plan = options?.plan ?? "free";
  const avatarUrl = options?.avatarUrl;
  const size = settings.qrSize;
  const showCenter = settings.showAvatarInQr;

  const matrix = QRCode.create(url, { errorCorrectionLevel: "H" });
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return QRCode.toDataURL(url, { width: size, margin: settings.qrMargin });
  }

  let centerSkip: CenterSkip | undefined;
  if (showCenter) {
    const useAvatar = isQrCenterAvatar(plan, avatarUrl) && !!avatarUrl;
    centerSkip = useAvatar ? centerSkipForAvatar(size) : centerSkipForBrandLogo(size);
  }

  drawStyledQrModules(
    ctx,
    matrix,
    size,
    Math.max(3, settings.qrMargin),
    settings.qrForeground,
    settings.qrBackground,
    centerSkip,
  );

  if (showCenter) {
    try {
      const centerSrc = resolveQrCenterImageUrl(plan, avatarUrl);
      if (isQrCenterAvatar(plan, avatarUrl) && avatarUrl) {
        await drawCenterAvatar(
          ctx,
          size,
          avatarUrl,
          settings.qrForeground,
        );
      } else {
        await drawCenterBrandLogo(ctx, size, centerSrc);
      }
    } catch {
      // mantém QR sem logo central
    }
  }

  return canvas.toDataURL("image/png");
}

function textAlignToCanvas(align: QrCodeSettings["linkStyle"]["alignment"]) {
  if (align === "left") return "left" as const;
  if (align === "right") return "right" as const;
  return "center" as const;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderQrCardToBlob(input: QrCardRenderInput): Promise<Blob> {
  const { pageUrl, settings, avatarUrl, plan = "free" } = input;
  const qrDataUrl = await generateQrDataUrl(pageUrl, settings, { avatarUrl, plan });

  const cardWidth = 280;
  const cardRadius = 20;
  const linkStyle = settings.linkStyle;
  const descStyle = settings.descriptionStyle;
  const qrDisplaySize = Math.min(settings.qrSize, 220);
  const qrFramePad = 12;
  const qrFrameRadius = 16;

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) throw new Error("Canvas não disponível");

  measureCtx.font = `600 ${descStyle.fontSize}px system-ui, sans-serif`;
  const descMaxWidth = cardWidth - descStyle.marginLeft - descStyle.marginRight;
  const descLines = wrapTextLines(measureCtx, settings.description, descMaxWidth);

  const cardHeight =
    linkStyle.marginTop +
    linkStyle.fontSize +
    linkStyle.marginBottom +
    qrFramePad * 2 +
    qrDisplaySize +
    4 +
    descStyle.marginTop +
    descLines.length * descStyle.fontSize +
    Math.max(0, descLines.length - 1) * 4 +
    descStyle.marginBottom;

  const canvas = document.createElement("canvas");
  canvas.width = cardWidth;
  canvas.height = cardHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não disponível");

  ctx.fillStyle = settings.cardBackground;
  ctx.beginPath();
  ctx.roundRect(0, 0, cardWidth, cardHeight, cardRadius);
  ctx.fill();

  let y = linkStyle.marginTop;
  ctx.font = `600 ${linkStyle.fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = linkStyle.color;
  ctx.textAlign = textAlignToCanvas(linkStyle.alignment);
  const textX =
    linkStyle.alignment === "left"
      ? linkStyle.marginLeft
      : linkStyle.alignment === "right"
        ? cardWidth - linkStyle.marginRight
        : cardWidth / 2;
  ctx.fillText(pageUrl.replace(/^https?:\/\//, ""), textX, y + linkStyle.fontSize);
  y += linkStyle.fontSize + linkStyle.marginBottom;

  const qrImg = await loadImage(qrDataUrl);
  const frameW = qrDisplaySize + qrFramePad * 2;
  const frameH = frameW;
  const frameX = (cardWidth - frameW) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(frameX, y, frameW, frameH, qrFrameRadius);
  ctx.fill();

  ctx.drawImage(qrImg, frameX + qrFramePad, y + qrFramePad, qrDisplaySize, qrDisplaySize);
  y += frameH + 4 + descStyle.marginTop;

  ctx.font = `600 ${descStyle.fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = descStyle.color;
  ctx.textAlign = textAlignToCanvas(descStyle.alignment);
  const descX =
    descStyle.alignment === "left"
      ? descStyle.marginLeft
      : descStyle.alignment === "right"
        ? cardWidth - descStyle.marginRight
        : cardWidth / 2;

  for (const line of descLines) {
    ctx.fillText(line, descX, y + descStyle.fontSize);
    y += descStyle.fontSize + 4;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Falha ao gerar imagem"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
