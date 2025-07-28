import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { ntParseWithZod } from "nt";
import { z } from "zod";
import {
  chainNameSchema,
  siteNameSchema,
} from "../../bl/quickbook/name-to-external-id-mappings.ts";
import { scrapSite } from "../../bl/scrap-site.ts";
import { createSite } from "../../bl/sites.ts";
import { selectSites } from "../../dal/db/sites.table.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
import { NotFoundException } from "../../shared/exceptions/not-found.exception.ts";
import { insertSiteSchema, siteSchema } from "../../shared/schema/sites.ts";
import { ensureRootMiddleware } from "./ensure-root.middleware.ts";

export const sitesRoute = new Hono();

sitesRoute.use(ensureRootMiddleware);

const siteDtoSchema = siteSchema
  .omit({
    resourceType: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi({ ref: "SiteDto" });

sitesRoute.get(
  "/",
  describeRoute({
    description: "List all sites",
    tags: ["sites"],
    security: [{ basicAuth: [] }],
    responses: {
      200: {
        description: "List of sites",
        content: {
          "application/json": {
            schema: resolver(z.array(siteDtoSchema)),
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  async (hc) => {
    const sites = await selectSites();

    const dtos = sites.andThen((sites) =>
      ntParseWithZod(sites, z.array(siteDtoSchema)).mapErr(
        (err) =>
          new BadOutputException("Failed to parse response to DTO", {
            cause: err,
          }),
      ),
    );

    return dtos.match(
      (value) => hc.json(value),
      (error) => hc.text(error.message, 500),
    );
  },
);

const insertSiteDtoSchema = insertSiteSchema
  .omit({ chainId: true, name: true })
  .extend({ chainName: chainNameSchema, name: siteNameSchema })
  .openapi({
    ref: "InsertSiteDto",
  });

sitesRoute.post(
  "/insert",
  describeRoute({
    description: "Insert site",
    tags: ["sites"],
    security: [{ basicAuth: [] }],
    responses: {
      201: {
        description: "Site was inserted",
        content: {
          "application/json": {
            schema: resolver(siteDtoSchema),
          },
        },
      },
      400: {
        description: "Bad Request",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  validator("json", insertSiteDtoSchema),
  async (hc) => {
    const site = await createSite(hc.req.valid("json"));

    const dto = site.andThen((inserted) =>
      ntParseWithZod(inserted, siteDtoSchema).mapErr(
        (err) =>
          new BadOutputException("Failed to parse response to DTO", {
            cause: err,
          }),
      ),
    );

    return dto.match(
      (value) => hc.json(value, 201),
      (error) => {
        let status: ContentfulStatusCode = 500;
        if (error instanceof BadInputException) {
          status = 400;
        }

        return hc.text(error.message, status);
      },
    );
  },
);

const scrapSiteDtoSchema = z
  .object({
    date: z.coerce.date(),
  })
  .openapi({ ref: "ScrapSiteDto" });

sitesRoute.post(
  "/:id/scrap",
  describeRoute({
    description: "Scrap a site",
    tags: ["sites"],
    security: [{ basicAuth: [] }],
    responses: {
      200: {
        description: "Site was scrapped",
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "Site not found",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  validator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  validator("json", scrapSiteDtoSchema),
  async (hc) => {
    const result = await scrapSite({
      id: hc.req.valid("param").id,
      date: hc.req.valid("json").date,
    });

    return result.match(
      (value) => hc.json(value),
      (error) => {
        let status: ContentfulStatusCode = 500;
        if (error instanceof NotFoundException) {
          status = 404;
        }

        return hc.text(error.message, status);
      },
    );
  },
);
