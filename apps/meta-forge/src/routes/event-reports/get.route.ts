import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver } from "hono-openapi";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import { eventReportPayloadSchema } from "../../shared/schema/jobs.ts";

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
          "application/json": { schema: resolver(eventReportPayloadSchema) },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Event report not found" },
    },
  }),
  (c) => {
    const { eventReport } = getAppContext();
    if (!eventReport) {
      throw new HTTPException(404, { message: "Event report was not found" });
    }

    return c.json(eventReport);
  },
);
