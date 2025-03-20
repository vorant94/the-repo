import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: `${import.meta.dirname}/src`,
    clearMocks: true,
  },
});
