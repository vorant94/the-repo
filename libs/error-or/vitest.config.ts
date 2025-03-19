import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: "./src",
    clearMocks: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "../coverage",
      reporter: ["text", "html"],
      exclude: ["**/*.d.ts", "**/*.spec.ts", "**/__mocks__/*"],
    },
  },
});
