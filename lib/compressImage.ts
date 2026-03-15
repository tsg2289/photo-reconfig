/**
 * Client-side image compression to avoid 413 Payload Too Large.
 * Resizes to max 2048px (our output max) and compresses as JPEG before upload.
 */

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.9;

export async function compressImageForUpload(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        // Already small enough, just re-encode as JPEG to reduce size
        drawAndExport(img, width, height, file.name, resolve, reject);
        return;
      }

      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }

      drawAndExport(img, width, height, file.name, resolve, reject);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

function drawAndExport(
  img: HTMLImageElement,
  width: number,
  height: number,
  originalName: string,
  resolve: (f: File) => void,
  reject: (e: Error) => void
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    reject(new Error("Canvas not supported"));
    return;
  }
  ctx.drawImage(img, 0, 0, width, height);

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        reject(new Error("Failed to compress image"));
        return;
      }
      const baseName = originalName.replace(/\.[^/.]+$/, "") || "image";
      const compressed = new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      resolve(compressed);
    },
    "image/jpeg",
    JPEG_QUALITY
  );
}
