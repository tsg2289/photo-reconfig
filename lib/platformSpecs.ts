export type RetailerId = "amazon" | "walmart" | "target";

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
    main: { width: 2000, height: 2000, aspect: "1:1", maxSizeMB: 10 },
    secondary: [
      { width: 2000, height: 2000, aspect: "1:1", label: "square" },
      { width: 1600, height: 1920, aspect: "5:6", label: "portrait" },
    ],
  },
  walmart: {
    main: { width: 2200, height: 2200, aspect: "1:1", maxSizeMB: 5 },
    secondary: [{ width: 2200, height: 2200, aspect: "1:1" }],
  },
  target: {
    main: { width: 2400, height: 2400, aspect: "1:1" },
    secondary: [{ width: 2400, height: 2400, aspect: "1:1" }],
  },
};
