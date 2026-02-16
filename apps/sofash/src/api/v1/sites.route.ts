import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import {
  chainNameSchema,
  siteNameSchema,
} from "../../bl/quickbook/name-to-external-id-mappings.ts";
import { scrapSite } from "../../bl/scrap-site.ts";
import { createSite } from "../../bl/sites.ts";
import { selectSites } from "../../dal/db/sites.table.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
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
    try {
      const sites = await selectSites();
      const dtosResult = z.array(siteDtoSchema).safeParse(sites);
      if (!dtosResult.success) {
        return hc.text("Failed to parse response to DTO", 500);
      }
      return hc.json(dtosResult.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return hc.text(message, 500);
    }
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
    try {
      const site = await createSite(hc.req.valid("json"));
      const dtoResult = siteDtoSchema.safeParse(site);
      if (!dtoResult.success) {
        return hc.text("Failed to parse response to DTO", 500);
      }
      return hc.json(dtoResult.data, 201);
    } catch (error) {
      if (error instanceof BadInputException) {
        return hc.text(error.message, 400);
      }
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return hc.text(message, 500);
    }
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
    try {
      const result = await scrapSite({
        id: hc.req.valid("param").id,
        date: hc.req.valid("json").date,
      });
      return hc.json(result);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return hc.text(error.message, 404);
      }
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return hc.text(message, 500);
    }
  },
);
