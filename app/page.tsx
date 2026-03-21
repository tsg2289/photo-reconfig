"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { SkuInput } from "@/components/SkuInput";
import { RetailerSelector } from "@/components/RetailerSelector";
import { ProcessButton } from "@/components/ProcessButton";
import type { RetailerId } from "@/lib/platformSpecs";
import type { CompressionPreset } from "@/lib/compressImage";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [sku, setSku] = useState("");
  const [retailers, setRetailers] = useState<RetailerId[]>(["funboy"]);
  const [funboyIncludeMain, setFunboyIncludeMain] = useState(true);
  const [compressUploads, setCompressUploads] = useState(true);
  const [compressionPreset, setCompressionPreset] =
    useState<CompressionPreset>("balanced");

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Photo Reconfig
          </h1>
          <p className="mt-2 text-foreground/70">
            Batch process images for Funboy and Amazon
          </p>
        </header>

        <ImageUploader files={files} onFilesChange={setFiles} />

        <SkuInput value={sku} onChange={setSku} />

        <RetailerSelector
          selected={retailers}
          onChange={setRetailers}
          funboyIncludeMain={funboyIncludeMain}
          onFunboyIncludeMainChange={setFunboyIncludeMain}
        />

        <ProcessButton
          files={files}
          sku={sku}
          retailers={retailers}
          funboyIncludeMain={funboyIncludeMain}
          compressUploads={compressUploads}
          onCompressUploadsChange={setCompressUploads}
          compressionPreset={compressionPreset}
          onCompressionPresetChange={setCompressionPreset}
          disabled={false}
        />
      </div>
    </div>
  );
}
