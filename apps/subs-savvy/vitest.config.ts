import { defineProject, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineProject({
    test: {
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      clearMocks: true,
      environment: "jsdom",
      setupFiles: ["./src/test-setup.ts"],
    },
  }),
);
