import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import {
  detectImageContentType,
  processImageForRetailer,
  sanitizeFilename,
  sanitizeSku,
} from "@/lib/imageProcessor";
import type { RetailerId } from "@/lib/platformSpecs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFiles = formData.getAll("images") as File[];
    const retailers = formData.getAll("retailers") as RetailerId[];
    const skuRaw = formData.get("sku") as string | null;
    const skuBase = skuRaw?.trim() ? sanitizeSku(skuRaw.trim()) : undefined;
    const funboyIncludeMain = formData.get("funboyIncludeMain") !== "false";

    if (!imageFiles.length || !retailers.length) {
      return NextResponse.json(
        { error: "Please provide images and select at least one retailer." },
        { status: 400 }
      );
    }

    const preparedImages = await Promise.all(
      imageFiles.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          buffer,
          baseName: sanitizeFilename(file.name),
          contentType: await detectImageContentType(buffer),
        };
      })
    );

    const entries: { path: string; buffer: Buffer }[] = [];

    for (const retailer of retailers) {
      for (let i = 0; i < preparedImages.length; i++) {
        const { buffer, baseName, contentType } = preparedImages[i];
        const isFirst = i === 0;

        const results = await processImageForRetailer(
          buffer,
          retailer,
          baseName,
          i,
          isFirst,
          contentType,
          skuBase,
          {
            includeMain: retailer === "funboy" ? funboyIncludeMain : true,
          }
        );

        for (const { buffer: imgBuffer, filename } of results) {
          entries.push({
            path: `${retailer}/${filename}`,
            buffer: imgBuffer,
          });
        }
      }
    }

    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);

      for (const { path, buffer } of entries) {
        archive.append(buffer, { name: path });
      }
      archive.finalize();
    });

    const zipBuffer = Buffer.concat(chunks);
    const zipFilename = skuBase ? `${skuBase}.zip` : "photo-reconfig.zip";
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
      },
    });
  } catch (err) {
    console.error("Process error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 }
    );
  }
}
