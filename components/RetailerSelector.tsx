"use client";

import { GlassCard } from "./GlassCard";
import type { RetailerId } from "@/lib/platformSpecs";

const RETAILERS: { id: RetailerId; label: string }[] = [
  { id: "amazon", label: "Amazon" },
];

interface RetailerSelectorProps {
  selected: RetailerId[];
  onChange: (selected: RetailerId[]) => void;
}

export function RetailerSelector({ selected, onChange }: RetailerSelectorProps) {
  const toggle = (id: RetailerId) => {
    if (selected.includes(id)) {
      onChange(selected.filter((r) => r !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <GlassCard className="p-6">
      <p className="mb-3 text-sm font-medium text-foreground/80">
        Select retailer(s)
      </p>
      <div className="flex flex-wrap gap-2">
        {RETAILERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selected.includes(id)
                ? "bg-white/25 text-foreground shadow-md"
                : "bg-white/10 text-foreground/70 hover:bg-white/15 hover:text-foreground/90"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-white/20 pt-4">
        <p className="mb-3 text-sm font-medium text-foreground/80">
          Dimensions
        </p>
        <div className="space-y-3 text-sm text-foreground/90">
          <div>
            <span className="font-medium">Image 1 (main):</span> 2048×2560
          </div>
          <div>
            <span className="font-medium">Images 2–6:</span> 1600×1600
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
