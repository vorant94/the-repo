import process from "node:process";
import { inspect, parseArgs } from "node:util";
import dotenv from "dotenv";
import { z } from "zod";
import { searchTmdbMovie } from "../src/dal/the-movie-db/the-movie-db.client.ts";
import { configSchema } from "../src/shared/context/config.ts";
import { runWithinContext } from "../src/shared/context/context.ts";
import { createLogger } from "../src/shared/logger/logger.ts";

dotenv.config();

const { name, page, year } = z
  .object({
    name: z.string(),
    page: z.coerce.number().default(1),
    year: z.coerce.number().default(new Date().getFullYear()),
  })
  .parse(
    parseArgs({
      options: {
        name: {
          type: "string",
        },
        page: {
          type: "string",
        },
      },
    }).values,
  );

const config = configSchema.parse(process.env);

// @ts-ignore utility script for checking stuff and both bot and db aren't needed here
await runWithinContext({ config, bot: {}, db: {} }, async () => {
  using logger = createLogger("search-tmdb-movie");

  logger.info(`searching movies with name ${name} and page ${page}`);

  const moviePage = await searchTmdbMovie({ name, page, year });

  moviePage.match(
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
