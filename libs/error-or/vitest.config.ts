import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // @ts-ignore libs aren't compiled by themselves needless to say their config files,
    // so the lack of tsconfig here that results in import.meta error can be safely ignored
    root: `${import.meta.dirname}/src`,
    clearMocks: true,
  },
});
