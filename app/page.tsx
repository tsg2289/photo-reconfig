"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { RetailerSelector } from "@/components/RetailerSelector";
import { ProcessButton } from "@/components/ProcessButton";
import type { RetailerId } from "@/lib/platformSpecs";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [retailers, setRetailers] = useState<RetailerId[]>([]);

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Photo Reconfig
          </h1>
          <p className="mt-2 text-foreground/70">
            Batch process images for Amazon, Walmart & Target
          </p>
        </header>

        <ImageUploader files={files} onFilesChange={setFiles} />

        <RetailerSelector selected={retailers} onChange={setRetailers} />

        <ProcessButton
          files={files}
          retailers={retailers}
          disabled={false}
        />
      </div>
    </div>
  );
}
