import { URL } from "node:url";
import { format } from "date-fns";
import { HTTPException } from "hono/http-exception";
import type { ResultAsync } from "neverthrow";
import { ntFetchJsonWithZod } from "nt";
import { z } from "zod";
import { createLogger } from "../../shared/logger/logger.ts";
import {
  type PlanetSiteId,
  type QuickbookChainId,
  type QuickbookSiteId,
  quickbookEventSchema,
  quickbookFilmSchema,
  type RavHenSiteId,
} from "./quickbook.dtos.ts";

export function findQuickbookFilmEvents(
  chainId: "10104",
  siteId: RavHenSiteId,
  date: Date,
): ResultAsync<FindQuickbookFilmEventsResponseBodyDto, HTTPException>;
export function findQuickbookFilmEvents(
  chainId: "10100",
  siteId: PlanetSiteId,
  date: Date,
): ResultAsync<FindQuickbookFilmEventsResponseBodyDto, HTTPException>;
export function findQuickbookFilmEvents(
  chainId: QuickbookChainId,
  siteId: QuickbookSiteId,
  date: Date,
): ResultAsync<FindQuickbookFilmEventsResponseBodyDto, HTTPException> {
  using logger = createLogger("findQuickbookFilmEvents");
  logger.debug("chain", chainId);
  logger.debug("site", siteId);

  const formattedDate = format(date, "yyyy-MM-dd");
  const apiPrefix = quickbookChainIdToApiPrefix[chainId];
  const baseUrl = quickbookChainIdToBaseUrl[chainId];
  const url = new URL(
    `${apiPrefix}/data-api-service/v1/quickbook/${chainId}/film-events/in-cinema/${siteId}/at-date/${formattedDate}`,
    baseUrl,
  );
  logger.debug("url", url.toString());

  return ntFetchJsonWithZod(
    url,
    findQuickbookFilmEventsResponseBodySchema,
  ).mapErr((err) => new HTTPException(500, { cause: err }));
}

export const findQuickbookFilmEventsResponseBodySchema = z.object({
  body: z.object({
    films: z.array(quickbookFilmSchema),
    events: z.array(quickbookEventSchema),
  }),
});

export type FindQuickbookFilmEventsResponseBodyDto = z.infer<
  typeof findQuickbookFilmEventsResponseBodySchema
>;

const quickbookChainIdToBaseUrl = {
  "10104": "https://www.rav-hen.co.il",
  "10100": "https://www.planetcinema.co.il",
} as const satisfies Record<QuickbookChainId, string>;

const quickbookChainIdToApiPrefix = {
  "10104": "/rh",
  "10100": "/il",
} as const satisfies Record<QuickbookChainId, string>;
