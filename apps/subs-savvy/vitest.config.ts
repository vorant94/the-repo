import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      root: `${import.meta.dirname}/src`,
      clearMocks: true,
      environment: "happy-dom",
      setupFiles: ["./src/test-setup.ts"],
    },
  }),
);
