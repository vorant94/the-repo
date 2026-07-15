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
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/__mocks__/*",
        "**/dist/*",
        "**/build/*",
        "**/*.pom.ts",
        "**/*.com.ts",
        "*.config.{ts,js}",
        "scripts/*",
        // mana-forge: rendered React (components, pages, layouts, app/main
        // wiring). Unit tests don't drive the DOM tree — no domain logic to
        // assert here, only Mantine/router composition.
        "apps/mana-forge/src/**/*.tsx",
        // mana-forge: route path constants — a plain string table, no behavior.
        "apps/mana-forge/src/globals/**",
        // mana-forge: thin DOM download helper (Blob + anchor click). Nothing
        // meaningful to assert outside a real browser.
        "apps/mana-forge/src/utils/download-text-file.ts",
        // mana-forge: jsdom/Mantine test harness, not production code.
        "apps/mana-forge/src/test-setup.ts",
      ],
      thresholds: {
        // Enforced only for mana-forge's pure logic (utils, stores, hooks).
        // Branches sits below the rest because a few defensive guards are
        // unreachable — Map.get on a key derived from the same map, and
        // Array.splice at an already-validated index — so they can't be
        // exercised by tests.
        "apps/mana-forge/src/**": {
          statements: 95,
          functions: 95,
          lines: 95,
          branches: 90,
        },
      },
    },
  },
});
