import { inspect, parseArgs } from "node:util";
import { addDays, format } from "date-fns";
import { z } from "zod";
import {
  chainNameToQuickbookChainId,
  planetSiteNameSchema,
  planetSiteNameToPlanetSiteId,
} from "../src/bl/scrapper/name-to-external-id-mappings.ts";
import { findQuickbookFilmEvents } from "../src/dal/quickbook/quickbook.client.ts";
import { runWithinContext } from "../src/shared/context/context.ts";
import { createLogger } from "../src/shared/logger/logger.ts";

const { site, date } = z
  .object({
    site: planetSiteNameSchema.default("ayalon"),
    date: z.coerce.date().default(addDays(new Date(), 1)),
  })
  .parse(
    parseArgs({
      options: {
        site: {
          type: "string",
        },
        date: {
          type: "string",
        },
      },
    }).values,
  );

await runWithinContext({}, async () => {
  using logger = createLogger("fetch-planet");

  logger.info(
    `fetching film events from ${site} for ${format(date, "yyyy-MM-dd")}`,
  );

  const filmEvents = await findQuickbookFilmEvents(
    chainNameToQuickbookChainId.planet,
    planetSiteNameToPlanetSiteId[site],
    date,
  );

  filmEvents.match(
    (filmEvents) => {
      logger.info(
        "response",
        inspect(filmEvents, {
          colors: true,
          depth: Number.POSITIVE_INFINITY,
          maxArrayLength: Number.POSITIVE_INFINITY,
        }),
      );
    },
    (error) => logger.error(error),
  );
});
