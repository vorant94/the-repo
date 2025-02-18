import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      root: "./src",
      clearMocks: true,
      coverage: {
        provider: "v8",
        reportsDirectory: "../coverage",
        reporter: ["text", "html"],
        exclude: [
          "**/*.d.ts",
          "**/*.spec.ts",
          "**/__mocks__/*",
          "main.ts",
          "shared/context/env.ts",
          "shared/schema",
        ],
      },
    },
  }),
);
