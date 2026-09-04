import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono-openapi";
import { z } from "zod";
import { EventReportPreview } from "../../components/event-report-preview.tsx";
import type { HonoEnv } from "../../shared/hono-env.ts";

export const eventReportPreviewRoute = new Hono<HonoEnv>();

const eventReportPreviewQuerySchema = z.object({
  mode: z.enum(["dark", "light"]).default("dark"),
});

eventReportPreviewRoute.get(
  "/preview",
  validator("query", eventReportPreviewQuerySchema),
  (c) => {
    const { mode } = c.req.valid("query");
    const { eventReport } = c.var;
    if (!eventReport) {
      throw new HTTPException(404, { message: "Event report was not found" });
    }

    return c.html(
      <EventReportPreview
        mode={mode}
        report={eventReport}
      />,
    );
  },
);
