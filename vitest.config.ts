/// <reference types="vitest" />
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Client test config for Deploy Center — F-002 / F-010.
// Coverage gate ratchets up across the v3.0 timeline (research D-10):
// wk1=0 → wk2=15 → wk3=22 → wk4=30 (GA gate, NFR-006).
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: false,
      coverage: {
        provider: "v8",
        reporter: ["text-summary", "lcov", "json-summary"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.d.ts",
          "src/main.tsx",
          "src/vite-env.d.ts",
          "src/test/**",
          "src/**/__tests__/**",
        ],
        thresholds: {
          // v3.0 GA gate per NFR-006 — raised to 30% by T094 (Phase 13).
          // wk1=0 → wk2=15 → wk3=22 → wk4=30 (current).
          lines: 30,
          statements: 30,
          functions: 25,
          branches: 25,
        },
      },
    },
  })
);
