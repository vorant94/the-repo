import { inspect, parseArgs } from "node:util";
import { addDays, format } from "date-fns";
import { z } from "zod";
import { findQuickbookFilmEvents } from "../src/dal/quickbook/quickbook.client.ts";
import { ravHenSiteSchema } from "../src/dal/quickbook/quickbook.dtos.ts";
import { runWithinContext } from "../src/shared/context/context.ts";
import { createLogger } from "../src/shared/logger/logger.ts";

const { site, date } = z
  .object({
    site: ravHenSiteSchema.default("dizengoff"),
    date: z.coerce.date().default(addDays(new Date(), 1)),
  })
  .parse(
    parseArgs({
      options: {
        tenantId: {
          type: "string",
        },
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
  using logger = createLogger("fetch-rav-hen");

  logger.info(
    `fetching film events from ${site} for ${format(date, "yyyy-MM-dd")}`,
  );

  const filmEvents = await findQuickbookFilmEvents("rav-hen", site, date);

  logger.info(
    "response",
    inspect(filmEvents, {
      colors: true,
      depth: Number.POSITIVE_INFINITY,
      maxArrayLength: Number.POSITIVE_INFINITY,
    }),
  );
});
