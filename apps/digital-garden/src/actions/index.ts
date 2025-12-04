import { defineAction } from "astro:actions";

export const server = {
  getMe: defineAction({
    handler: (_, ctx) => {
      return ctx.locals.session;
    },
  }),
};
