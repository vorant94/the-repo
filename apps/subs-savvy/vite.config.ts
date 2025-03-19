import path from "node:path";
import process from "node:process";
import react from "@vitejs/plugin-react-swc";
import { i18nextHMRPlugin } from "i18next-hmr/vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import dotenvConfig from "./dotenv.config.ts";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    dotenvConfig.NODE_ENV !== "production" &&
      i18nextHMRPlugin({
        localesDir: path.resolve(process.cwd(), "public/locales"),
      }),
  ],
});
