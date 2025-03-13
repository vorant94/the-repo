import { builtinModules } from "node:module";
import path from "node:path";
import process from "node:process";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    target: "es2022", // so the "using" keyword introduced with TS 5.2 is available
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(process.cwd(), "src/main.ts"),
      formats: ["es"],
      fileName: "main",
    },
    rollupOptions: {
      external: [...builtinModules, /^node:/], // without it rollup tries to "bundle" node built-in modules
      output: {
        inlineDynamicImports: true, // prevent multiple chunks since it is easier for CF to work with a single file
      },
    },
  },
  plugins: [
    devServer({
      entry: path.resolve(process.cwd(), "src/main.ts"),
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src/"),
    },
  },
});
