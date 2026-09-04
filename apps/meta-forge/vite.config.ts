import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    target: "es2022", // so the "using" keyword introduced with TS 5.2 is available
  },
  build: {
    sourcemap: true,
  },
  server: {
    hmr: false, // without it swagger UI page gets refreshed on code change, very annoying
    cors: false, // to avoid conflicts with hono cors middleware
  },
  plugins: [cloudflare()],
});
