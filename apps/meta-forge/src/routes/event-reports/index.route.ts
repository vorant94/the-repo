import type { Context, Next } from "hono";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { findEventReport } from "../../queries/find-event-report.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import { idSchema } from "../../shared/id-schema.ts";
import { eventReportGetRoute } from "./get.route.ts";
import { eventReportImportRoute } from "./import.route.ts";
import { eventReportPreviewRoute } from "./preview.route.tsx";

export const eventReportsRoute = new Hono<HonoEnv>();

eventReportsRoute.route("/import", eventReportImportRoute);
eventReportsRoute.use("/:id", eventReportMiddleware);
eventReportsRoute.use("/:id/*", eventReportMiddleware);
eventReportsRoute.route("/:id", eventReportGetRoute);
if (import.meta.env.DEV) {
  eventReportsRoute.route("/:id", eventReportPreviewRoute);
}

async function eventReportMiddleware(c: Context<HonoEnv>, next: Next) {
  const { id } = idSchema.parse(c.req.param());
  const eventReport = await findEventReport(id);
  if (!eventReport) {
    throw new HTTPException(404, { message: "Event report was not found" });
  }

  c.set("eventReport", eventReport);
  await next();
}
