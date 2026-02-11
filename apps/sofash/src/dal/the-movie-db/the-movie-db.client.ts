import { getContext } from "../../shared/context/context.ts";
import { UnexpectedBranchException } from "../../shared/exceptions/unexpected-branch.exception.ts";
import {
  type TmdbMoviePage,
  tmdbMoviePageSchema,
} from "./the-movie-db.dtos.ts";

export async function searchTmdbMovie({
  name,
  page = 1,
  year,
}: SearchTmdbMovieParams): Promise<TmdbMoviePage> {
  const { config } = getContext();

  const url = new URL("/3/search/movie", baseUrl);
  url.searchParams.set("query", name);
  url.searchParams.set("page", page.toString());
  year && url.searchParams.set("year", year.toString());

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${config.TMDB_AUTH_TOKEN}`);
  headers.set("accept", "application/json");

  let json: unknown;
  try {
    const response = await fetch(new Request(url, { method: "GET", headers }));
    json = await response.json();
  } catch (cause) {
    throw new UnexpectedBranchException("Failed to search for a movie", {
      cause,
    });
  }

  const result = tmdbMoviePageSchema.safeParse(json);
  if (!result.success) {
    throw new UnexpectedBranchException("Failed to parse TMDB response", {
      cause: result.error,
    });
  }

  return result.data;
}

export interface SearchTmdbMovieParams {
  name: string;
  page?: number;
  year?: number;
}

const baseUrl = "https://api.themoviedb.org";
