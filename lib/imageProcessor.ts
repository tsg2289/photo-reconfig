import sharp from "sharp";
import type { ImageSpec, RetailerId } from "./platformSpecs";
import { PLATFORMS } from "./platformSpecs";

const OUTPUT_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };
const SAFE_MARGIN_RATIO = 0.04;

export async function processImage(
  inputBuffer: Buffer,
  spec: ImageSpec
): Promise<Buffer> {
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
      const buffer = await processImage(inputBuffer, config.main);
      results.push({ buffer, folder: "main", filename });
    } else {
      const spec = config.secondary[0];
      const buffer = await processImage(inputBuffer, spec);
      results.push({ buffer, folder: "secondary", filename });
    }
    return results;
  }

  // Original mode: main + secondary variants
  const idx = String(imageNum).padStart(2, "0");

  if (shouldCreateMain) {
    const buffer = await processImage(inputBuffer, config.main);
    results.push({
      buffer,
      folder: "main",
      filename: `${baseName}-main.jpg`,
    });
  }

  for (const spec of config.secondary) {
    const buffer = await processImage(inputBuffer, spec);
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
