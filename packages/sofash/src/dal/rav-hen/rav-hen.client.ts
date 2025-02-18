import { URL } from "node:url";
import { format } from "date-fns";
import { z } from "zod";
import { catchError } from "../../shared/lib/error-or/catch-error.ts";
import type { ErrorOr } from "../../shared/lib/error-or/error-or.ts";
import {
  type RavHenSiteId,
  ravHenEventSchema,
  ravHenFilmSchema,
} from "./rav-hen.dtos.ts";

export async function findRavHenFilmEvents(
  siteId: RavHenSiteId,
  date: Date,
): Promise<ErrorOr<FindRavHenFilmEventsResponseBodyDto>> {
  const formattedDate = format(date, "yyyy-MM-dd");
  const url = new URL(
    `/rh/data-api-service/v1/quickbook/${tenantId}/film-events/in-cinema/${siteId}/at-date/${formattedDate}`,
    "https://www.rav-hen.co.il",
  );
  const [fetchError, response] = await catchError(fetch(url));
  if (fetchError) {
    return [fetchError];
  }

  const [jsonError, json] = await catchError(response.json());
  if (jsonError) {
    return [jsonError];
  }

  const [parsingError, parsed] = catchError(() =>
    findRavHenFilmEventsResponseBodySchema.parse(json),
  );
  if (parsingError) {
    return [parsingError];
  }

  return [undefined, parsed];
}

export const findRavHenFilmEventsResponseBodySchema = z.object({
  body: z.object({
    films: z.array(ravHenFilmSchema),
    events: z.array(ravHenEventSchema),
  }),
});

export type FindRavHenFilmEventsResponseBodyDto = z.infer<
  typeof findRavHenFilmEventsResponseBodySchema
>;

const tenantId = "10104";
