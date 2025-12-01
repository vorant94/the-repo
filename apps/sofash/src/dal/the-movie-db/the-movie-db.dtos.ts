import { z } from "zod";

const tmdbPageSchema = z.object({
  page: z.number(),
  results: z.array(z.unknown()),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  total_pages: z.number(),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  total_results: z.number(),
});

const tmdbMovieSchema = z.object({
  adult: z.boolean(),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  backdrop_path: z.string(),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  genre_ids: z.array(z.number()),
  id: z.number(),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  original_language: z.string(),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  poster_path: z.string(),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  release_date: z.coerce.date(),
  title: z.string(),
  video: z.boolean(),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  vote_average: z.number(),
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  vote_count: z.number(),
});

export const tmdbMoviePageSchema = tmdbPageSchema
  .omit({ results: true })
  .extend({
    results: z.array(tmdbMovieSchema),
  });
export type TmdbMoviePage = z.infer<typeof tmdbMoviePageSchema>;
