import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver } from "hono-openapi";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import { monthlyReportPayloadSchema } from "../../shared/schema/jobs.ts";

export const monthlyReportGetRoute = new Hono<HonoEnv>();

monthlyReportGetRoute.get(
  "/",
  describeRoute({
    description: "Get a monthly report with its event hosts",
    tags: ["monthly reports"],
    responses: {
      200: {
        description: "Monthly report",
        content: {
          "application/json": { schema: resolver(monthlyReportPayloadSchema) },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Monthly report not found" },
    },
  }),
  (c) => {
    const { monthlyReport } = getAppContext();
    if (!monthlyReport) {
      throw new HTTPException(404, { message: "Monthly report was not found" });
    }

    return c.json(monthlyReport);
  },
);
