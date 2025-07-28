import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { ntParseWithZod } from "nt";
import { z } from "zod";
import { selectTitles } from "../../dal/db/titles.table.ts";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
import { titleSchema } from "../../shared/schema/titles.ts";
import { ensureRootMiddleware } from "./ensure-root.middleware.ts";

export const titlesRoute = new Hono();

titlesRoute.use(ensureRootMiddleware);

const titleDtoSchema = titleSchema
  .omit({
    resourceType: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi({ ref: "TitleDto" });

titlesRoute.get(
  "/",
  describeRoute({
    description: "List all titles",
    tags: ["titles"],
    security: [{ basicAuth: [] }],
    responses: {
      200: {
        description: "List of titles",
        content: {
          "application/json": {
            schema: resolver(z.array(titleDtoSchema)),
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
    const sites = await selectTitles();

    const dtos = sites.andThen((sites) =>
      ntParseWithZod(sites, z.array(titleDtoSchema)).mapErr(
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
