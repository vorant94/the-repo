import type { ResultAsync } from "neverthrow";
import { ntFetchJsonWithZod } from "nt";
import { getContext } from "../../shared/context/context.ts";
import { UnexpectedBranchException } from "../../shared/exceptions/unexpected-branch.exception.ts";
import {
  type TmdbMoviePage,
  tmdbMoviePageSchema,
} from "./the-movie-db.dtos.ts";

export function searchTmdbMovie({
  name,
  page = 1,
  year,
}: SearchTmdbMovieParams): ResultAsync<
  TmdbMoviePage,
  UnexpectedBranchException
> {
  const { config } = getContext();

  const url = new URL("/3/search/movie", baseUrl);
  url.searchParams.set("query", name);
  url.searchParams.set("page", page.toString());
  year && url.searchParams.set("year", year.toString());

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${config.TMDB_AUTH_TOKEN}`);
  headers.set("accept", "application/json");

  return ntFetchJsonWithZod(
    new Request(url, { method: "GET", headers }),
    tmdbMoviePageSchema,
  ).mapErr(
    (err) =>
      new UnexpectedBranchException("Failed to search for a movie", {
        cause: err,
      }),
  );
}

export interface SearchTmdbMovieParams {
  name: string;
  page?: number;
  year?: number;
}

const baseUrl = "https://api.themoviedb.org";
