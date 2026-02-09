import externalSlugify from "slugify";

// see https://github.com/simov/slugify/issues/173
export const slugify =
  externalSlugify as unknown as typeof externalSlugify.default;
