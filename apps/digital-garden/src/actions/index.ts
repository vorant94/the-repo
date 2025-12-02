import { defineAction } from "astro:actions";
import z from "zod";

export const server = {
  getGreeting: defineAction({
    input: z.object({
      name: z.string(),
    }),
    handler: (input) => {
      return `Hello, ${input.name}!`;
    },
  }),
};
