import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver } from "hono-openapi";
import { eventReportDtoSchema } from "../../queries/find-event-report.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";

export const eventReportGetRoute = new Hono<HonoEnv>();

eventReportGetRoute.get(
  "/",
  describeRoute({
    description: "Get an event report with its host and standings",
    tags: ["event reports"],
    responses: {
      200: {
        description: "Event report",
        content: {
          "application/json": { schema: resolver(eventReportDtoSchema) },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Event report not found" },
    },
  }),
  (c) => {
    const { eventReport } = c.var;
    if (!eventReport) {
      throw new HTTPException(404, { message: "Event report was not found" });
    }

    return c.json(eventReport);
  },
);
