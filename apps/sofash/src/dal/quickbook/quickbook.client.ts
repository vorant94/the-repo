import { URL } from "node:url";
import { format } from "date-fns";
import { HTTPException } from "hono/http-exception";
import type { ResultAsync } from "neverthrow";
import { ntFetchJsonWithZod } from "nt";
import { z } from "zod";
import { createLogger } from "../../shared/logger/logger.ts";
import {
  type PlanetSite,
  type PlanetSiteId,
  type QuickbookSite,
  type QuickbookSiteId,
  type QuickbookTenant,
  type RavHenSite,
  type RavHenSiteId,
  quickbookEventSchema,
  quickbookFilmSchema,
} from "./quickbook.dtos.ts";

export function findQuickbookFilmEvents(
  tenant: "rav-hen",
  site: RavHenSite,
  date: Date,
): ResultAsync<FindQuickbookFilmEventsResponseBodyDto, HTTPException>;
export function findQuickbookFilmEvents(
  tenant: "planet",
  site: PlanetSite,
  date: Date,
): ResultAsync<FindQuickbookFilmEventsResponseBodyDto, HTTPException>;
export function findQuickbookFilmEvents(
  tenant: QuickbookTenant,
  site: QuickbookSite,
  date: Date,
): ResultAsync<FindQuickbookFilmEventsResponseBodyDto, HTTPException> {
  using logger = createLogger("findQuickbookFilmEvents");
  logger.debug("tenant", tenant);
  logger.debug("site", site);

  const formattedDate = format(date, "yyyy-MM-dd");
  const apiPrefix = quickbookTenantToApiPrefix[tenant];
  const tenantId = quickbookTenantToTenantId[tenant];
  // @ts-ignore fuck this shit, i don't want to do TS shenanigans here at the moment
  const siteId = quickbookTenantToSiteToSiteId[tenant][site];
  const baseUrl = quickbookTenantToBaseUrl[tenant];
  const url = new URL(
    `${apiPrefix}/data-api-service/v1/quickbook/${tenantId}/film-events/in-cinema/${siteId}/at-date/${formattedDate}`,
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

const ravHenSiteToRavHenSiteId = {
  givatayim: "1058",
  dizengoff: "1071",
  "kiryat-ono": "1062",
} as const satisfies Record<RavHenSite, RavHenSiteId>;

const planetSiteToPlanetSiteId = {
  ayalon: "1025",
  "beer-sheva": "1074",
  "zichron-yaakov": "1075",
  haifa: "1070",
  jerusalem: "1073",
  "rishon-letziyon": "1072",
} as const satisfies Record<PlanetSite, PlanetSiteId>;

const quickbookTenantToSiteToSiteId = {
  "rav-hen": ravHenSiteToRavHenSiteId,
  planet: planetSiteToPlanetSiteId,
} as const satisfies Record<
  QuickbookTenant,
  // fuck this as well, let it be Partial since I'm currently not interested in how to properly type it
  Partial<Record<QuickbookSite, QuickbookSiteId>>
>;
