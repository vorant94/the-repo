import { randomUUID } from "node:crypto";
import { inspect, parseArgs } from "node:util";
import { addDays } from "date-fns";
import { z } from "zod";
import { findQuickbookFilmEvents } from "../src/dal/quickbook/quickbook.client.ts";
import { ravHenSiteIdSchema } from "../src/dal/quickbook/quickbook.dtos.ts";
import {
  type Context,
  runWithinContext,
} from "../src/shared/context/context.ts";
import { createLogger } from "../src/shared/logger/logger.ts";

const { siteId, date } = z
  .object({
    siteId: ravHenSiteIdSchema.default("1058"),
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

await runWithinContext({ requestId: randomUUID() } as Context, async () => {
  using logger = createLogger("fetch-rav-hen");

  const [error, filmEvents] = await findQuickbookFilmEvents(
    "rav-hen",
    siteId,
    date,
  );
  if (error) {
    logger.error(error);
    return;
  }

  logger.info(
    "response",
    inspect(filmEvents, {
      colors: true,
      depth: Number.POSITIVE_INFINITY,
      maxArrayLength: Number.POSITIVE_INFINITY,
    }),
  );
});
