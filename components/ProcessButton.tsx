"use client";

import { useState } from "react";
import { GlassCard } from "./GlassCard";
import type { RetailerId } from "@/lib/platformSpecs";
import { compressImageForUpload } from "@/lib/compressImage";

interface ProcessButtonProps {
  files: File[];
  sku: string;
  retailers: RetailerId[];
  disabled: boolean;
}

export function ProcessButton({
  files,
  sku,
  retailers,
  disabled,
}: ProcessButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (files.length === 0 || retailers.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Compress images client-side to avoid 413 Payload Too Large
      const compressed = await Promise.all(
        files.map((f) => compressImageForUpload(f))
      );

      const formData = new FormData();
      compressed.forEach((f) => formData.append("images", f));
      retailers.forEach((r) => formData.append("retailers", r));
      if (sku.trim()) formData.append("sku", sku.trim());
      formData.append("useAi", "no");

      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error(
            "Images are too large. Try uploading fewer images or smaller files."
          );
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Process failed: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const zipFilename = res.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/)?.[1] ?? "photo-reconfig.zip";
      a.download = zipFilename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading || files.length === 0 || retailers.length === 0;

  return (
    <GlassCard className="p-6">
      <button
        type="button"
        onClick={handleProcess}
        disabled={isDisabled}
        className={`w-full rounded-xl px-6 py-4 text-lg font-semibold transition-all ${
          isDisabled
            ? "cursor-not-allowed bg-white/10 text-foreground/50"
            : "bg-white/20 text-foreground hover:bg-white/30 hover:shadow-lg"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
            Processing…
          </span>
        ) : (
          "Process & Download ZIP"
        )}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}
    </GlassCard>
  );
}
