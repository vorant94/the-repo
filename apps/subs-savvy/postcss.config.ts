import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import type { Config } from "postcss-load-config";
import postcssNested from "postcss-nested";
import postcssPresetMantine from "postcss-preset-mantine";
import postcssSimpleVars from "postcss-simple-vars";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting";

export default {
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
} satisfies Config;
