/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
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
    tailwindcss(),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
