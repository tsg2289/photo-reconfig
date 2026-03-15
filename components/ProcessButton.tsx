"use client";

import { useState } from "react";
import { GlassCard } from "./GlassCard";
import type { RetailerId } from "@/lib/platformSpecs";

interface ProcessButtonProps {
  files: File[];
  retailers: RetailerId[];
  disabled: boolean;
}

export function ProcessButton({
  files,
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
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      retailers.forEach((r) => formData.append("retailers", r));
      formData.append("useAi", "no");

      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Process failed: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "photo-reconfig.zip";
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
