import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { ntParseWithZod } from "nt";
import { z } from "zod";
import { ensureRoot } from "../../bl/auth/ensure-root.ts";
import { insertSite, selectSites } from "../../dal/db/sites.table.ts";
import { insertSiteSchema, siteSchema } from "../../shared/schema/sites.ts";

export const sitesRoute = new Hono();

sitesRoute.use(ensureRoot);

const siteDtoSchema = siteSchema
  .omit({
    resourceType: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi({ ref: "SiteDto" });

const insertSiteDtoSchema = insertSiteSchema.openapi({
  ref: "InsertSiteDto",
});

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
    },
  }),
  async (hc) => {
    const sites = await selectSites();

    const dtos = sites.andThen((selected) =>
      ntParseWithZod(selected, z.array(siteDtoSchema)).mapErr(
        (err) =>
          new HTTPException(500, {
            message: "Failed to parse response to DTO",
            cause: err,
          }),
      ),
    );
    if (dtos.isErr()) {
      throw dtos.error;
    }

    return hc.json(dtos.value);
  },
);

sitesRoute.post(
  "/insert",
  describeRoute({
    description: "Insert site",
    tags: ["sites"],
    security: [{ basicAuth: [] }],
    responses: {
      201: {
        description: "Chain was inserted",
        content: {
          "application/json": {
            schema: resolver(siteDtoSchema),
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      400: {
        description: "Bad Request",
      },
      409: {
        description: "Site already exists",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  validator("json", insertSiteDtoSchema),
  async (hc) => {
    const chain = await insertSite(hc.req.valid("json"));

    const dto = chain.andThen((upserted) =>
      ntParseWithZod(upserted, siteDtoSchema).mapErr(
        (err) =>
          new HTTPException(500, {
            message: "Failed to parse response to DTO",
            cause: err,
          }),
      ),
    );
    if (dto.isErr()) {
      throw dto.error;
    }

    return hc.json(dto.value, 201);
  },
);
