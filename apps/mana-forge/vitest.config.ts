import { defineProject, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// biome-ignore lint/suspicious/noExplicitAny: plugin type can be nested arrays/objects
const filterPlugins = (plugins: Array<any>): Array<any> => {
  return plugins.flatMap((p) => {
    if (Array.isArray(p)) {
      return filterPlugins(p);
    }
    if (!p) {
      return [];
    }
    const name =
      typeof p === "object" && "name" in p ? (p as { name: string }).name : "";
    if (name.includes("cloudflare") || name.includes("react-router")) {
      return [];
    }
    return [p];
  });
};

const cleanViteConfig = {
  ...viteConfig,
  plugins: viteConfig.plugins ? filterPlugins(viteConfig.plugins) : [],
};

export default mergeConfig(
  cleanViteConfig,
  defineProject({
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.ts"],
      restoreMocks: true,
      setupFiles: ["./src/test-setup.ts"],
    },
  }),
);
