import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import postcssPresetMantine from "postcss-preset-mantine";
import postcssSimpleVars from "postcss-simple-vars";
import { defineConfig } from "vite";

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssPresetMantine,
        postcssSimpleVars({
          variables: {
            "mantine-breakpoint-xs": "640px",
            "mantine-breakpoint-sm": "768px",
            "mantine-breakpoint-md": "1024px",
            "mantine-breakpoint-lg": "1280px",
            "mantine-breakpoint-xl": "1536px",
          },
        }),
      ],
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    reactRouter(),
    tailwindcss(),
  ],
});
