import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import type { Text } from "hast";
import { h } from "hastscript";
// biome-ignore lint/suspicious/noShadowRestrictedNames: 3-rd party name
import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeClassNames from "rehype-class-names";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import {
  defaultLang,
  languages,
  languageToLocale,
} from "./src/globals/i18n.ts";

const legacyI18nRedirects = {
  "/": `/${defaultLang}`,
  "/about/": `/${defaultLang}/about`,
  "/rss.xml": `/${defaultLang}/rss.xml`,
  "/posts/": `/${defaultLang}/posts`,
  "/posts/aws-amplify-functions-on-steroids/": `/${defaultLang}/posts/aws-amplify-functions-on-steroids`,
  "/posts/divide-and-conquer-right-concerns-to-separate/": `/${defaultLang}/posts/divide-and-conquer-right-concerns-to-separate`,
  "/posts/typescript-monorepos-are-a-mess/": `/${defaultLang}/posts/typescript-monorepos-are-a-mess`,
  "/posts/pitfalls-of-aws-amplify-serverless-containers/": `/${defaultLang}/posts/pitfalls-of-aws-amplify-serverless-containers`,
  "/posts/dart-through-the-eyes-of-a-js-ts-dev/": `/${defaultLang}/posts/dart-through-the-eyes-of-a-js-ts-dev`,
  "/posts/branding-an-angular-app-with-docker-volumes-and-css3-variables/": `/${defaultLang}/posts/branding-an-angular-app-with-docker-volumes-and-css3-variables`,
  "/posts/usecallback-react-isnt-as-simple-as-people-consider-it/": `/${defaultLang}/posts/usecallback-react-isnt-as-simple-as-people-consider-it`,
  "/posts/war-in-israel/": `/${defaultLang}/posts/war-in-israel`,
  "/posts/why-brave-new-world-is-actually-a-utopia/": `/${defaultLang}/posts/why-brave-new-world-is-actually-a-utopia`,
  "/tags/react/": `/${defaultLang}/tags/react`,
  "/tags/books/": `/${defaultLang}/tags/books`,
  "/tags/lambda/": `/${defaultLang}/tags/lambda`,
  "/tags/angular/": `/${defaultLang}/tags/angular`,
  "/tags/dart/": `/${defaultLang}/tags/dart`,
  "/tags/design-patterns/": `/${defaultLang}/tags/design-patterns`,
  "/tags/separation-of-concerns/": `/${defaultLang}/tags/separation-of-concerns`,
  "/tags/programming/": `/${defaultLang}/tags/programming`,
  "/tags/amplify/": `/${defaultLang}/tags/amplify`,
  "/tags/serverless/": `/${defaultLang}/tags/serverless`,
  "/tags/docker/": `/${defaultLang}/tags/docker`,
  "/tags/typescript/": `/${defaultLang}/tags/typescript`,
  "/tags/node/": `/${defaultLang}/tags/node`,
  "/tags/infra/": `/${defaultLang}/tags/infra`,
  "/tags/psychology/": `/${defaultLang}/tags/psychology`,
  "/tags/war/": `/${defaultLang}/tags/war`,
  "/tags/self-reflection/": `/${defaultLang}/tags/self-reflection`,
};

export default defineConfig({
  adapter: cloudflare(),
  site: "https://vorant94.dev",
  trailingSlash: "never",
  prefetch: true,
  env: {
    schema: {
      // biome-ignore lint/style/useNamingConvention: env variables have different convention
      GITHUB_CLIENT_ID: envField.string({
        context: "server",
        access: "secret", // its not actually secret, but making it public here would mean that it should be accessible in buildtime for astro to in-line it in the bundle and i want to control it in runtime
      }),
      // biome-ignore lint/style/useNamingConvention: env variables have different convention
      GITHUB_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  i18n: {
    locales: [...languages],
    defaultLocale: defaultLang,
    routing: {
      prefixDefaultLocale: true,
    },
  },
  redirects: { ...legacyI18nRedirects },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: defaultLang,
        locales: languageToLocale,
      },
      serialize(item) {
        const maybeI18nRedirect = new URL(item.url).pathname.replace(
          `/${defaultLang}/`,
          "/",
        );
        if (maybeI18nRedirect in legacyI18nRedirects) {
          item.links ??= [];
          item.links.push({
            url: new URL(maybeI18nRedirect, "https://vorant94.dev").toString(),
            lang: defaultLang,
          });
        }

        return item;
      },
    }),
  ],
  vite: {
    css: {
      postcss: {
        plugins: [autoprefixer, cssnano],
      },
    },
    plugins: [tailwindcss()],
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
            // can't use directly with dots, because it fails to pass tailwindcss
            // class detection
            const classnames = "ml-2 invisible text-sm group-hover:visible";

            return h(`span.${classnames.replace(" ", ".")}`, "🔗");
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
