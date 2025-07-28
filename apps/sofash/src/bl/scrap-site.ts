import { ResultAsync } from "neverthrow";
import { getChainById } from "../dal/db/chains.table.ts";
import { getSiteById } from "../dal/db/sites.table.ts";
import { findQuickbookFilmEvents } from "../dal/quickbook/quickbook.client.ts";
import { searchTmdbMovie } from "../dal/the-movie-db/the-movie-db.client.ts";
import type { BadOutputException } from "../shared/exceptions/bad-output.exception.ts";
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
      // @ts-ignore fuck it, i don't want to go too deep into these TS shenanigans
      chainNameToSiteNameToQuickbookSiteId[chainName][siteName],
      date,
    ),
  );

  return filmEvents.andThen(({ body: { films } }) =>
    ResultAsync.combine(
      // TODO make sure there are no duplicates in films array to avoid redundant TMDB requests
      films.map((film) => {
        const tmdbResult = searchTmdbMovie({
          name: film.name,
          year: film.releaseYear,
        });

        // TODO validate there is only 1 page with only 1 result
        return tmdbResult.map((result) => result.results[0]);
      }),
    ),
  );
}

export interface ScrapSiteParams {
  id: string;
  date: Date;
}
