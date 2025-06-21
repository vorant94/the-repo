import { URL } from "node:url";
import { format } from "date-fns";
import { type ErrorOr, catchError } from "error-or";
import { z } from "zod";
import { createLogger } from "../../shared/logger/logger.ts";
import {
  type PlanetSiteId,
  QuickbookEventSchema,
  type QuickbookTenant,
  type RavHenSiteId,
  quickbookFilmSchema,
} from "./quickbook.dtos.ts";

export async function findQuickbookFilmEvents(
  tenant: "rav-hen",
  siteId: RavHenSiteId,
  date: Date,
): Promise<ErrorOr<FindQuickbookFilmEventsResponseBodyDto>>;
export async function findQuickbookFilmEvents(
  tenant: "planet",
  siteId: PlanetSiteId,
  date: Date,
): Promise<ErrorOr<FindQuickbookFilmEventsResponseBodyDto>>;
export async function findQuickbookFilmEvents(
  tenant: QuickbookTenant,
  siteId: RavHenSiteId | PlanetSiteId,
  date: Date,
): Promise<ErrorOr<FindQuickbookFilmEventsResponseBodyDto>> {
  using logger = createLogger("findQuickbookFilmEvents");
  logger.debug("tenant", tenant);

  const formattedDate = format(date, "yyyy-MM-dd");
  const apiPrefix = quickbookTenantToApiPrefix[tenant];
  const tenantId = quickbookTenantToTenantId[tenant];
  const baseUrl = quickbookTenantToBaseUrl[tenant];
  const url = new URL(
    `${apiPrefix}/data-api-service/v1/quickbook/${tenantId}/film-events/in-cinema/${siteId}/at-date/${formattedDate}`,
    baseUrl,
  );
  logger.debug("url", url.toString());

  const [fetchError, response] = await catchError(fetch(url));
  if (fetchError) {
    return [fetchError];
  }

  const [jsonError, json] = await catchError(response.json());
  if (jsonError) {
    return [jsonError];
  }

  const [parsingError, parsed] = catchError(() =>
    findQuickbookFilmEventsResponseBodySchema.parse(json),
  );
  if (parsingError) {
    return [parsingError];
  }

  return [undefined, parsed];
}

export const findQuickbookFilmEventsResponseBodySchema = z.object({
  body: z.object({
    films: z.array(quickbookFilmSchema),
    events: z.array(QuickbookEventSchema),
  }),
});

export type FindQuickbookFilmEventsResponseBodyDto = z.infer<
  typeof findQuickbookFilmEventsResponseBodySchema
>;

const quickbookTenantToTenantId = {
  "rav-hen": "10104",
  planet: "10100",
} as const satisfies Record<QuickbookTenant, string>;

const quickbookTenantToBaseUrl = {
  "rav-hen": "https://www.rav-hen.co.il",
  planet: "https://www.planetcinema.co.il",
} as const satisfies Record<QuickbookTenant, string>;

const quickbookTenantToApiPrefix = {
  "rav-hen": "/rh",
  planet: "/il",
} as const satisfies Record<QuickbookTenant, string>;
