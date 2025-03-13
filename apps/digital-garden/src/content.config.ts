import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const basePost = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(reference("tags")),
  publishedAt: z.date(),
  related: z.array(reference("posts")).nullish(),
  isPinned: z.boolean().nullish().default(false),
  codeUrl: z.string().url().nullish(),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/posts" }),
  schema: ({ image }) =>
    z.union([
      basePost.extend({
        coverImage: image(),
        coverAlt: z.string(),
        coverImageDark: image().nullish(),
      }),
      basePost.extend({
        coverImage: z.void(),
      }),
    ]),
});

// TODO report a bug when simultaneously adding a new entry and immediately referencing it
const tags = defineCollection({
  loader: () => {
    return [
      "react",
      "books",
      "lambda",
      "angular",
      "dart",
      "design-patterns",
      "separation-of-concerns",
      "programming",
      "amplify",
      "serverless",
      "docker",
      "typescript",
      "node",
      "infra",
      "psychology",
      "war",
      "self-reflection",
    ].map((tag) => ({ id: tag }));
  },
  schema: z.object({
    id: z.string(),
  }),
});

export const collections = { posts, tags };
