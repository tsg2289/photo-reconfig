"use client";

import { GlassCard } from "./GlassCard";
import {
  PLATFORMS,
  RETAILER_LABELS,
  type RetailerId,
} from "@/lib/platformSpecs";

const RETAILERS = (Object.entries(RETAILER_LABELS) as [RetailerId, string][]).map(
  ([id, label]) => ({ id, label })
);

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

  const selectedRetailers = selected.map((id) => ({
    id,
    label: RETAILER_LABELS[id],
    specs: PLATFORMS[id],
  }));

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
        {selectedRetailers.length > 0 ? (
          <div className="space-y-4 text-sm text-foreground/90">
            {selectedRetailers.map(({ id, label, specs }) => (
              <div key={id} className="space-y-2">
                <p className="font-medium text-foreground">{label}</p>
                <div>
                  <span className="font-medium">Image 1 (main):</span>{" "}
                  {specs.main.width}x{specs.main.height}
                </div>
                <div>
                  <span className="font-medium">Images 2–6:</span>{" "}
                  {specs.secondary[0].width}x{specs.secondary[0].height}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/70">
            Select a retailer to view dimensions.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
