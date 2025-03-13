import path from "node:path";
import process from "node:process";
import alpine from "@astrojs/alpinejs";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import type { Text } from "hast";
import { h } from "hastscript";
// biome-ignore lint/suspicious/noShadowRestrictedNames: 3-rd party name
import { toString } from "mdast-util-to-string";
import postcssNested from "postcss-nested";
import getReadingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeClassNames from "rehype-class-names";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting";
import { z } from "zod";

export const env = z
  .object({
    // biome-ignore lint/style/useNamingConvention: env variables have different convention
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  })
  .parse(process.env);

export default defineConfig({
  site:
    env.NODE_ENV === "production"
      ? "https://digital-garden-4u8.pages.dev"
      : "http://localhost:4321",
  prefetch: true,
  integrations: [
    sitemap(),
    alpine({
      entrypoint: "/src/alpine.entrypoint",
    }),
  ],
  vite: {
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
          cssnano,
          tailwindcssNesting(postcssNested),
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src/"),
      },
    },
  },
  markdown: {
    remarkPlugins: [
      () =>
        (tree, { data }) => {
          const textOnPage = toString(tree);
          const readingTime = getReadingTime(textOnPage);
          // biome-ignore lint/style/noNonNullAssertion: copied from astro docs
          data.astro!.frontmatter!.minutesRead = readingTime.text;
        },
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeClassNames,
        {
          "h1,h2,h3,h4,h5,h6": "group",
        } satisfies Parameters<typeof rehypeClassNames>[0],
      ],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          content: () => {
            return h("span.ml-2.invisible.text-sm.group-hover:visible", "🔗");
          },
          properties: ({ children }) => {
            const text = children.find(
              (child): child is Text => child.type === "text",
            );
            return {
              className: "no-underline",
              ariaLabel: text?.value,
            };
          },
        } satisfies Parameters<typeof rehypeAutolinkHeadings>[0],
      ],
      [
        rehypeExternalLinks,
        {
          target: "_blank",
        } satisfies Parameters<typeof rehypeExternalLinks>[0],
      ],
    ],
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
