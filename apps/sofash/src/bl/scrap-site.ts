import { getChainById } from "../dal/db/chains.table.ts";
import { getSiteById } from "../dal/db/sites.table.ts";
import { upsertTitle } from "../dal/db/titles.table.ts";
import { findQuickbookFilmEvents } from "../dal/quickbook/quickbook.client.ts";
import { searchTmdbMovie } from "../dal/the-movie-db/the-movie-db.client.ts";
import { BadOutputException } from "../shared/exceptions/bad-output.exception.ts";
import type { Title } from "../shared/schema/titles.ts";
import {
  chainNameToQuickbookChainId,
  chainNameToSiteNameToQuickbookSiteId,
} from "./quickbook/name-to-external-id-mappings.ts";
import { validateChainToSiteAssociation } from "./quickbook/validate-chain-to-site-association.ts";

export async function scrapSite({
  id,
  date,
}: ScrapSiteParams): Promise<Array<Title>> {
  const site = await getSiteById(id);
  const chain = await getChainById(site.chainId);

  const [chainName, siteName] = validateChainToSiteAssociation(
    chain.name,
    site.name,
  );

  const filmEvents = await findQuickbookFilmEvents(
    chainNameToQuickbookChainId[chainName],
    // @ts-expect-error fuck it, i don't want to go too deep into these TS shenanigans
    chainNameToSiteNameToQuickbookSiteId[chainName][siteName],
    date,
  );

  // TODO make sure there are no duplicates in films array to avoid redundant TMDB requests
  return await Promise.all(
    filmEvents.body.films.map(async (film) => {
      const tmdbResult = await searchTmdbMovie({
        name: film.name,
        year: film.releaseYear,
      });

      if (tmdbResult.total_pages > 1 || tmdbResult.results.length > 1) {
        throw new BadOutputException(
          `Too many TMDB results for [${film.name}] movie of [${film.releaseYear}] year`,
        );
      }

      const movie = tmdbResult.results[0];
      if (!movie) {
        throw new BadOutputException(
          `No TMDB results for [${film.name}] movie of [${film.releaseYear}] year`,
        );
      }

      return await upsertTitle({
        externalId: movie.id.toString(),
        name: movie.title,
        releasedAt: movie.release_date,
      });
    }),
  );
}

export interface ScrapSiteParams {
  id: string;
  date: Date;
}
