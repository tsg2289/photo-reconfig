export type RetailerId = "amazon";

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

export const PLATFORMS: Record<RetailerId, PlatformConfig> = {
  amazon: {
    main: { width: 2048, height: 2560, aspect: "4:5", maxSizeMB: 10 },
    secondary: [{ width: 1600, height: 1600, aspect: "1:1" }],
  },
};
