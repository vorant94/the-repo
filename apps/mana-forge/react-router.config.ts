import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  buildDirectory: "dist",
  ssr: true,
  future: {
    // biome-ignore lint/style/useNamingConvention: React Router configuration key
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
