import type { Context, Next } from "hono";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { findEventReport } from "../../queries/find-event-report.ts";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import { idSchema } from "../../shared/id-schema.ts";
import { eventReportCreateRoute } from "./create.route.ts";
import { eventReportGenerateRoute } from "./generate.route.ts";
import { eventReportGetRoute } from "./get.route.ts";
import { eventReportPreviewRoute } from "./preview.route.tsx";

export const eventReportsRoute = new Hono<HonoEnv>();

eventReportsRoute.route("/", eventReportCreateRoute);
eventReportsRoute.use("/:id", eventReportMiddleware);
eventReportsRoute.use("/:id/*", eventReportMiddleware);
eventReportsRoute.route("/:id", eventReportGetRoute);
eventReportsRoute.route("/:id", eventReportGenerateRoute);
if (import.meta.env.DEV) {
  eventReportsRoute.route("/:id", eventReportPreviewRoute);
}

async function eventReportMiddleware(c: Context<HonoEnv>, next: Next) {
  const { id } = idSchema.parse(c.req.param());
  const eventReport = await findEventReport(id);
  if (!eventReport) {
    throw new HTTPException(404, { message: "Event report was not found" });
  }

  getAppContext().eventReport = eventReport;
  await next();
}
