import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { selectTitles } from "../../dal/db/titles.table.ts";
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
    try {
      const titles = await selectTitles();
      const dtosResult = z.array(titleDtoSchema).safeParse(titles);
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
