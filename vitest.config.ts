import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["{apps,libs,tools}/*/vitest.config.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "**/*.d.ts",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/__mocks__/*",
        "**/dist/*",
        "**/build/*",
        "**/*.pom.ts",
        "**/*.com.ts",
        "*.config.{ts,js}",
        "scripts/*",
      ],
    },
  },
});
