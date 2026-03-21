/**
 * Client-side image compression to avoid 413 Payload Too Large.
 * Resizes large uploads and adjusts JPEG quality toward a target file size.
 */

export type CompressionPreset = "high" | "balanced" | "smallest";

interface CompressionConfig {
  maxDimension: number;
  startQuality: number;
  minQuality: number;
  qualityStep: number;
  targetSizeBytes: number;
}

interface CompressionOptions {
  enabled?: boolean;
  preset?: CompressionPreset;
}

const PRESET_CONFIGS: Record<CompressionPreset, CompressionConfig> = {
  high: {
    maxDimension: 2048,
    startQuality: 0.92,
    minQuality: 0.84,
    qualityStep: 0.04,
    targetSizeBytes: 1_800 * 1024,
  },
  balanced: {
    maxDimension: 2048,
    startQuality: 0.9,
    minQuality: 0.78,
    qualityStep: 0.05,
    targetSizeBytes: 1_200 * 1024,
  },
  smallest: {
    maxDimension: 1800,
    startQuality: 0.84,
    minQuality: 0.68,
    qualityStep: 0.06,
    targetSizeBytes: 800 * 1024,
  },
};

export async function compressImageForUpload(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  if (!options.enabled) return file;

  const preset = options.preset ?? "balanced";
  const config = PRESET_CONFIGS[preset];
  const img = await loadImage(file);
  const { width, height } = getResizedDimensions(
    img.width,
    img.height,
    config.maxDimension
  );

  if (
    width === img.width &&
    height === img.height &&
    file.size <= config.targetSizeBytes
  ) {
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let quality = config.startQuality;
  let bestBlob = await canvasToBlob(canvas, quality);

  while (
    bestBlob.size > config.targetSizeBytes &&
    quality - config.qualityStep >= config.minQuality
  ) {
    quality -= config.qualityStep;
    const candidate = await canvasToBlob(canvas, quality);
    bestBlob = candidate;
  }

  if (
    width === img.width &&
    height === img.height &&
    bestBlob.size >= file.size
  ) {
    return file;
  }

  return blobToJpegFile(bestBlob, file.name);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

function getResizedDimensions(
  width: number,
  height: number,
  maxDimension: number
) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round((height * maxDimension) / width),
    };
  }

  return {
    width: Math.round((width * maxDimension) / height),
    height: maxDimension,
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image"));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

function blobToJpegFile(blob: Blob, originalName: string): File {
  const baseName = originalName.replace(/\.[^/.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
