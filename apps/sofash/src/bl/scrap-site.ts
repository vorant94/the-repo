import { err, ok, ResultAsync } from "neverthrow";
import { getChainById } from "../dal/db/chains.table.ts";
import { getSiteById } from "../dal/db/sites.table.ts";
import { upsertTitle } from "../dal/db/titles.table.ts";
import { findQuickbookFilmEvents } from "../dal/quickbook/quickbook.client.ts";
import { searchTmdbMovie } from "../dal/the-movie-db/the-movie-db.client.ts";
import { BadOutputException } from "../shared/exceptions/bad-output.exception.ts";
import type { NotFoundException } from "../shared/exceptions/not-found.exception.ts";
import type { UnexpectedBranchException } from "../shared/exceptions/unexpected-branch.exception.ts";
import {
  chainNameToQuickbookChainId,
  chainNameToSiteNameToQuickbookSiteId,
} from "./quickbook/name-to-external-id-mappings.ts";
import { validateChainToSiteAssociation } from "./quickbook/validate-chain-to-site-association.ts";

export function scrapSite({
  id,
  date,
}: ScrapSiteParams): ResultAsync<
  object,
  UnexpectedBranchException | BadOutputException | NotFoundException
> {
  const site = getSiteById(id);
  const chain = site.andThen((site) => getChainById(site.chainId));

  const associationValidated = ResultAsync.combine([chain, site]).andThen(
    ([chain, site]) => validateChainToSiteAssociation(chain.name, site.name),
  );

  const filmEvents = associationValidated.andThen(([chainName, siteName]) =>
    findQuickbookFilmEvents(
      chainNameToQuickbookChainId[chainName],
      // @ts-expect-error fuck it, i don't want to go too deep into these TS shenanigans
      chainNameToSiteNameToQuickbookSiteId[chainName][siteName],
      date,
    ),
  );

  return filmEvents.andThen(({ body: { films } }) =>
    ResultAsync.combine(
      // TODO make sure there are no duplicates in films array to avoid redundant TMDB requests
      films.map((film) => {
        const tmdbResults = searchTmdbMovie({
          name: film.name,
          year: film.releaseYear,
        });

        const movieResult = tmdbResults.andThen((result) => {
          if (result.total_pages > 1 || result.results.length > 1) {
            return err(
              new BadOutputException(
                `Too many TMDB results for [${film.name}] movie of [${film.releaseYear}] year`,
              ),
            );
          }
          const movie = result.results[0];
          if (!movie) {
            return err(
              new BadOutputException(
                `No TMDB results for [${film.name}] movie of [${film.releaseYear}] year`,
              ),
            );
          }

          return ok(movie);
        });

        return movieResult.andThen((movie) =>
          upsertTitle({
            externalId: movie.id.toString(),
            name: movie.title,
            releasedAt: movie.release_date,
          }),
        );
      }),
    ),
  );
}

export interface ScrapSiteParams {
  id: string;
  date: Date;
}
