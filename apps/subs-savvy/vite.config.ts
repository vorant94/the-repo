import path from "node:path";
import process from "node:process";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { i18nextHMRPlugin } from "i18next-hmr/vite";
import postcssNested from "postcss-nested";
import postcssPresetMantine from "postcss-preset-mantine";
import postcssSimpleVars from "postcss-simple-vars";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import dotenvConfig from "./dotenv.config.ts";

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
        cssnano,
        tailwindcssNesting(postcssNested),
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
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    svgr(),
    dotenvConfig.NODE_ENV !== "production" &&
      i18nextHMRPlugin({
        localesDir: path.resolve(process.cwd(), "public/locales"),
      }),
  ],
});
