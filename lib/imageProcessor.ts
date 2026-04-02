import sharp from "sharp";
import type { ImageSpec, RetailerId } from "./platformSpecs";
import { PLATFORMS } from "./platformSpecs";
import type { ImageContentType } from "./imageTypes";

const OUTPUT_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };
const SAFE_MARGIN_RATIO = 0.04;
const DETECTION_SAMPLE_SIZE = 96;
const WHITE_CHANNEL_THRESHOLD = 242;
const WHITE_VARIANCE_THRESHOLD = 18;

function isNearWhite(r: number, g: number, b: number) {
  return (
    r >= WHITE_CHANNEL_THRESHOLD &&
    g >= WHITE_CHANNEL_THRESHOLD &&
    b >= WHITE_CHANNEL_THRESHOLD &&
    Math.max(r, g, b) - Math.min(r, g, b) <= WHITE_VARIANCE_THRESHOLD
  );
}

export async function detectImageContentType(
  inputBuffer: Buffer
): Promise<ImageContentType> {
  const { data, info } = await sharp(inputBuffer)
    .rotate()
    .flatten({ background: OUTPUT_BACKGROUND })
    .resize(DETECTION_SAMPLE_SIZE, DETECTION_SAMPLE_SIZE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const totalPixels = width * height;

  if (totalPixels === 0 || channels < 3) {
    return "product";
  }

  const borderX = Math.max(1, Math.floor(width * 0.12));
  const borderY = Math.max(1, Math.floor(height * 0.12));
  const cornerX = Math.max(1, Math.floor(width * 0.18));
  const cornerY = Math.max(1, Math.floor(height * 0.18));

  let whitePixels = 0;
  let borderPixels = 0;
  let borderWhitePixels = 0;
  let cornerPixels = 0;
  let cornerWhitePixels = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const white = isNearWhite(r, g, b);

      if (white) {
        whitePixels += 1;
      } else {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      const isBorder =
        x < borderX || x >= width - borderX || y < borderY || y >= height - borderY;
      if (isBorder) {
        borderPixels += 1;
        if (white) {
          borderWhitePixels += 1;
        }
      }

      const isCorner =
        (x < cornerX && y < cornerY) ||
        (x >= width - cornerX && y < cornerY) ||
        (x < cornerX && y >= height - cornerY) ||
        (x >= width - cornerX && y >= height - cornerY);
      if (isCorner) {
        cornerPixels += 1;
        if (white) {
          cornerWhitePixels += 1;
        }
      }
    }
  }

  const whiteRatio = whitePixels / totalPixels;
  const borderWhiteRatio = borderPixels > 0 ? borderWhitePixels / borderPixels : 0;
  const cornerWhiteRatio = cornerPixels > 0 ? cornerWhitePixels / cornerPixels : 0;

  if (maxX === -1 || maxY === -1) {
    return "product";
  }

  const subjectCoverage =
    ((maxX - minX + 1) * (maxY - minY + 1)) / totalPixels;
  const touchesFrame =
    minX <= 1 || minY <= 1 || maxX >= width - 2 || maxY >= height - 2;

  if (
    cornerWhiteRatio >= 0.82 &&
    borderWhiteRatio >= 0.7 &&
    whiteRatio >= 0.3 &&
    subjectCoverage <= 0.9
  ) {
    return "product";
  }

  if (whiteRatio >= 0.45 && borderWhiteRatio >= 0.68 && subjectCoverage <= 0.82) {
    return "product";
  }

  if (touchesFrame || borderWhiteRatio <= 0.45 || cornerWhiteRatio <= 0.45) {
    return "lifestyle";
  }

  return whiteRatio >= 0.32 ? "product" : "lifestyle";
}

export async function processImage(
  inputBuffer: Buffer,
  spec: ImageSpec,
  contentType?: ImageContentType
): Promise<Buffer> {
  const resolvedContentType =
    contentType ?? (await detectImageContentType(inputBuffer));

  if (resolvedContentType === "lifestyle") {
    return sharp(inputBuffer)
      .resize(spec.width, spec.height, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  const horizontalPadding = Math.max(12, Math.round(spec.width * SAFE_MARGIN_RATIO));
  const verticalPadding = Math.max(12, Math.round(spec.height * SAFE_MARGIN_RATIO));
  const innerWidth = Math.max(1, spec.width - horizontalPadding * 2);
  const innerHeight = Math.max(1, spec.height - verticalPadding * 2);

  return sharp(inputBuffer)
    .flatten({ background: OUTPUT_BACKGROUND })
    .trim({ background: OUTPUT_BACKGROUND, threshold: 10 })
    .resize(innerWidth, innerHeight, {
      fit: "contain",
      position: "center",
      background: OUTPUT_BACKGROUND,
    })
    .extend({
      top: verticalPadding,
      bottom: verticalPadding,
      left: horizontalPadding,
      right: horizontalPadding,
      background: OUTPUT_BACKGROUND,
    })
    .jpeg({ quality: 90 })
    .toBuffer();
}

export interface ProcessedFile {
  buffer: Buffer;
  folder: "main" | "secondary";
  filename: string;
}

export async function processImageForRetailer(
  inputBuffer: Buffer,
  retailer: RetailerId,
  baseName: string,
  imageIndex: number,
  isFirstImage: boolean,
  contentType?: ImageContentType,
  skuBase?: string,
  options?: {
    includeMain?: boolean;
  }
): Promise<ProcessedFile[]> {
  const config = PLATFORMS[retailer];
  const results: ProcessedFile[] = [];
  const imageNum = imageIndex + 1;
  const includeMain = options?.includeMain ?? true;
  const shouldCreateMain = isFirstImage && includeMain;

  if (skuBase) {
    // SKU mode: one file per image, named SKU-1, SKU-2, etc.
    const filename = `${skuBase}-${imageNum}.jpg`;
    if (shouldCreateMain) {
      const buffer = await processImage(inputBuffer, config.main, contentType);
      results.push({ buffer, folder: "main", filename });
    } else {
      const spec = config.secondary[0];
      const buffer = await processImage(inputBuffer, spec, contentType);
      results.push({ buffer, folder: "secondary", filename });
    }
    return results;
  }

  // Original mode: main + secondary variants
  const idx = String(imageNum).padStart(2, "0");

  if (shouldCreateMain) {
    const buffer = await processImage(inputBuffer, config.main, contentType);
    results.push({
      buffer,
      folder: "main",
      filename: `${baseName}-main.jpg`,
    });
  }

  for (const spec of config.secondary) {
    const buffer = await processImage(inputBuffer, spec, contentType);
    const suffix = spec.label ? `-${spec.label}` : "";
    results.push({
      buffer,
      folder: "secondary",
      filename: `${baseName}-${idx}${suffix}.jpg`,
    });
  }

  return results;
}

export function sanitizeFilename(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "").trim();
  // Only remove characters invalid in filenames: \ / : * ? " < > |
  const safe = base.replace(/[\\/:*?"<>|]/g, "-").replace(/-+/g, "-").trim();
  return safe || "image";
}

export function sanitizeSku(sku: string): string {
  const trimmed = sku.trim();
  // Remove characters invalid in filenames: \ / : * ? " < > |
  const safe = trimmed.replace(/[\\/:*?"<>|]/g, "-").replace(/-+/g, "-").trim();
  return safe || "image";
}
