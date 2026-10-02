import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { EventReportPreview } from "../../components/event-report-preview.tsx";
import { getAppContext } from "../../shared/app-context.ts";
import { getEventReportPages } from "../../shared/event-report-pages.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";

export const eventReportPreviewRoute = new Hono<HonoEnv>();

const eventReportPreviewQuerySchema = z.object({
  mode: z.enum(["dark", "light"]).default("dark"),
  page: z.coerce.number().int().positive().default(1),
});

eventReportPreviewRoute.get(
  "/preview",
  describeRoute({
    description: "Preview an event report",
    tags: ["event reports"],
    responses: {
      200: {
        description: "Event report preview",
        content: { "text/html": { schema: { type: "string" } } },
      },
      404: { description: "Event report not found" },
    },
  }),
  validator("query", eventReportPreviewQuerySchema),
  (c) => {
    const { mode, page } = c.req.valid("query");
    const { eventReport } = getAppContext();
    if (!eventReport) {
      throw new HTTPException(404, { message: "Event report was not found" });
    }
    const reportPage = getEventReportPages(eventReport.ranks.length).at(
      page - 1,
    );
    if (!reportPage) {
      throw new HTTPException(404, { message: "Report page was not found" });
    }

    return c.html(
      <EventReportPreview
        mode={mode}
        page={reportPage}
        report={eventReport}
      />,
    );
  },
);
