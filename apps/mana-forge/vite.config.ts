import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import postcssPresetMantine from "postcss-preset-mantine";
import postcssSimpleVars from "postcss-simple-vars";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

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
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Mana Forge",
        // biome-ignore lint/style/useNamingConvention: Web Manifest standard key
        short_name: "Mana Forge",
        description:
          "Magic: The Gathering web tool for forge, deck building, and brewing.",
        // biome-ignore lint/style/useNamingConvention: Web Manifest standard key
        theme_color: "#1a1b1e",
        // biome-ignore lint/style/useNamingConvention: Web Manifest standard key
        background_color: "#1a1b1e",
        display: "standalone",
        // biome-ignore lint/style/useNamingConvention: Web Manifest standard key
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "favicon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "favicon.svg",
            sizes: "192x192 512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "index.html",
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
