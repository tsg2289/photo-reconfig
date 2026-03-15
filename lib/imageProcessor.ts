import sharp from "sharp";
import type { ImageSpec, RetailerId } from "./platformSpecs";
import { PLATFORMS } from "./platformSpecs";

export async function processImage(
  inputBuffer: Buffer,
  spec: ImageSpec
): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize(spec.width, spec.height, { fit: "cover", position: "center" })
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
  skuBase?: string
): Promise<ProcessedFile[]> {
  const config = PLATFORMS[retailer];
  const results: ProcessedFile[] = [];
  const imageNum = imageIndex + 1;

  if (skuBase) {
    // SKU mode: one file per image, named SKU-1, SKU-2, etc.
    const filename = `${skuBase}-${imageNum}.jpg`;
    if (isFirstImage) {
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

  if (isFirstImage) {
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
