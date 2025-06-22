import { inspect, parseArgs } from "node:util";
import { addDays } from "date-fns";
import { z } from "zod";
import { findQuickbookFilmEvents } from "../src/dal/quickbook/quickbook.client.ts";
import { planetSiteIdSchema } from "../src/dal/quickbook/quickbook.dtos.ts";
import { runWithinContext } from "../src/shared/context/context.ts";
import { createLogger } from "../src/shared/logger/logger.ts";

const { siteId, date } = z
  .object({
    siteId: planetSiteIdSchema.default("1072"),
    date: z.coerce.date().default(addDays(new Date(), 1)),
  })
  .parse(
    parseArgs({
      options: {
        tenantId: {
          type: "string",
        },
        siteId: {
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

  const filmEvents = await findQuickbookFilmEvents("planet", siteId, date);

  logger.info(
    "response",
    inspect(filmEvents, {
      colors: true,
      depth: Number.POSITIVE_INFINITY,
      maxArrayLength: Number.POSITIVE_INFINITY,
    }),
  );
});
