/// <reference types="vitest/config" />
import path from "node:path";
import process from "node:process";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { i18nextHMRPlugin } from "i18next-hmr/vite";
import postcssPresetMantine from "postcss-preset-mantine";
import postcssSimpleVars from "postcss-simple-vars";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import dotenvConfig from "./dotenv.config.ts";

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        autoprefixer,
        cssnano,
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
    tailwindcss(),
  ],
  test: {
    root: `${import.meta.dirname}/src`,
    clearMocks: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
