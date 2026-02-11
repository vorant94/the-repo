import { URL } from "node:url";
import { format } from "date-fns";
import { z } from "zod";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
import { UnexpectedBranchException } from "../../shared/exceptions/unexpected-branch.exception.ts";
import { createLogger } from "../../shared/logger/logger.ts";
import {
  type QuickbookChainId,
  type QuickbookSiteId,
  quickbookEventSchema,
  quickbookFilmSchema,
} from "./quickbook.dtos.ts";

export async function findQuickbookFilmEvents(
  chainId: QuickbookChainId,
  siteId: QuickbookSiteId,
  date: Date,
): Promise<FindQuickbookFilmEventsResponseBodyDto> {
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

  let json: unknown;
  try {
    const response = await fetch(url);
    json = await response.json();
  } catch (cause) {
    throw new UnexpectedBranchException("Failed to fetch film events", {
      cause,
    });
  }

  const result = findQuickbookFilmEventsResponseBodySchema.safeParse(json);
  if (!result.success) {
    throw new BadOutputException("Failed to parse quickbook response", {
      cause: result.error,
    });
  }

  return result.data;
}

const findQuickbookFilmEventsResponseBodySchema = z.object({
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
