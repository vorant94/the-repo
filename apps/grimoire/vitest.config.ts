import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    include: ["{src,e2e}/**/*.test.ts"],
  },
});
