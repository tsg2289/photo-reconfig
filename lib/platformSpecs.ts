export type RetailerId = "funboy" | "amazon";

export interface ImageSpec {
  width: number;
  height: number;
  aspect: string;
  label?: string;
  maxSizeMB?: number;
}

export interface PlatformConfig {
  main: ImageSpec;
  secondary: ImageSpec[];
}

export const RETAILER_LABELS: Record<RetailerId, string> = {
  funboy: "Funboy",
  amazon: "Amazon",
};

export const PLATFORMS: Record<RetailerId, PlatformConfig> = {
  funboy: {
    main: { width: 2048, height: 2560, aspect: "4:5", maxSizeMB: 10 },
    secondary: [{ width: 1600, height: 1600, aspect: "1:1" }],
  },
  amazon: {
    main: { width: 1600, height: 1600, aspect: "1:1", maxSizeMB: 10 },
    secondary: [{ width: 1600, height: 1600, aspect: "1:1" }],
  },
};
