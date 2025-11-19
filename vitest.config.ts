import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["{apps,libs,tools}/*/vite.config.ts"],
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
        "tools/*",
        "**/*.pom.ts",
        "**/*.com.ts",
        "{apps,libs,tools}/*/*.config.{ts,js}",
        "{apps,libs,tools}/*/scripts/*",
      ],
    },
  },
});
