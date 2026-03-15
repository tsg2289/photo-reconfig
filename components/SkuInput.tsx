"use client";

import { GlassCard } from "./GlassCard";

interface SkuInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SkuInput({ value, onChange, placeholder = "e.g. FLAT-LNGR-GREEN-STRIPE" }: SkuInputProps) {
  return (
    <GlassCard className="p-6">
      <p className="mb-3 text-sm font-medium text-foreground/80">
        SKU name
      </p>
      <p className="mb-3 text-xs text-foreground/60">
        Images will be named SKU-1, SKU-2, SKU-3, etc. in the download.
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-white/10 px-4 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-white/30"
      />
    </GlassCard>
  );
}
