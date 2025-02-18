import console from "node:console";
import { inspect, parseArgs } from "node:util";
import { addDays, format } from "date-fns";
import { z } from "zod";

const { siteId, date } = z
  .object({
    siteId: z.coerce.number().default(1),
    date: z.coerce.date().default(addDays(new Date(), 1)),
  })
  .parse(
    parseArgs({
      options: {
        siteId: {
          type: "string",
        },
        date: {
          type: "string",
        },
      },
    }).values,
  );

const response = await fetch(
  `https://www.hotcinema.co.il/tickets/TheaterEvents2?date=${format(date, "dd/MM/yyyy")}&theatreid=${siteId}`,
);
const json = await response.json();

console.info(
  inspect(json, {
    colors: true,
    depth: Number.POSITIVE_INFINITY,
    maxArrayLength: Number.POSITIVE_INFINITY,
  }),
);
