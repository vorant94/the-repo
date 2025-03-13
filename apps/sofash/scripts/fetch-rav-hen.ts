import console from "node:console";
import { inspect, parseArgs } from "node:util";
import { addDays } from "date-fns";
import { z } from "zod";
import { findRavHenFilmEvents } from "../src/dal/rav-hen/rav-hen.client.ts";
import { ravHenSiteIdSchema } from "../src/dal/rav-hen/rav-hen.dtos.ts";
import { reThrowError } from "../src/shared/lib/error-or/re-throw-error.ts";

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

const filmEvents = await reThrowError(findRavHenFilmEvents(siteId, date));

console.info(
  inspect(filmEvents, {
    colors: true,
    depth: Number.POSITIVE_INFINITY,
    maxArrayLength: Number.POSITIVE_INFINITY,
  }),
);
