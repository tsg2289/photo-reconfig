"use client";

import { useState } from "react";
import { GlassCard } from "./GlassCard";
import type { RetailerId } from "@/lib/platformSpecs";
import {
  compressImageForUpload,
  type CompressionPreset,
} from "@/lib/compressImage";

const COMPRESSION_PRESETS: { id: CompressionPreset; label: string }[] = [
  { id: "high", label: "High quality" },
  { id: "balanced", label: "Balanced" },
  { id: "smallest", label: "Smallest file" },
];

interface ProcessButtonProps {
  files: File[];
  sku: string;
  retailers: RetailerId[];
  funboyIncludeMain: boolean;
  compressUploads: boolean;
  onCompressUploadsChange: (enabled: boolean) => void;
  compressionPreset: CompressionPreset;
  onCompressionPresetChange: (preset: CompressionPreset) => void;
  disabled: boolean;
}

export function ProcessButton({
  files,
  sku,
  retailers,
  funboyIncludeMain,
  compressUploads,
  onCompressUploadsChange,
  compressionPreset,
  onCompressionPresetChange,
  disabled,
}: ProcessButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (files.length === 0 || retailers.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const compressed = await Promise.all(
        files.map((file) =>
          compressImageForUpload(file, {
            enabled: compressUploads,
            preset: compressionPreset,
          })
        )
      );

      const formData = new FormData();
      compressed.forEach((file) => formData.append("images", file));
      retailers.forEach((r) => formData.append("retailers", r));
      if (retailers.includes("funboy")) {
        formData.append("funboyIncludeMain", String(funboyIncludeMain));
      }
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

  const isDisabled =
    disabled || loading || files.length === 0 || retailers.length === 0;

  return (
    <GlassCard className="p-6">
      <div className="mb-5 space-y-4 border-b border-white/20 pb-5">
        <label className="flex items-center gap-3 text-sm text-foreground/90">
          <input
            type="checkbox"
            checked={compressUploads}
            onChange={(event) => onCompressUploadsChange(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/10"
          />
          <span>Compress images before upload</span>
        </label>

        <div className="space-y-2">
          <label
            htmlFor="compression-preset"
            className="block text-sm font-medium text-foreground/80"
          >
            Compression level
          </label>
          <select
            id="compression-preset"
            value={compressionPreset}
            onChange={(event) =>
              onCompressionPresetChange(event.target.value as CompressionPreset)
            }
            disabled={!compressUploads || loading}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-foreground outline-none transition focus:border-white/35 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {COMPRESSION_PRESETS.map(({ id, label }) => (
              <option key={id} value={id} className="bg-slate-900 text-white">
                {label}
              </option>
            ))}
          </select>
          <p className="text-xs text-foreground/60">
            {compressUploads
              ? "High quality keeps more detail, while smaller presets reduce upload size more aggressively."
              : "Compression is off. Original uploads may be slower or too large to process."}
          </p>
        </div>
      </div>

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
