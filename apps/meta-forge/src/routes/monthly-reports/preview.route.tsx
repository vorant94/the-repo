import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { MonthlyReportPreview } from "../../components/monthly-report-preview.tsx";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";

export const monthlyReportPreviewRoute = new Hono<HonoEnv>();

const monthlyReportPreviewQuerySchema = z.object({
  mode: z.enum(["dark", "light"]).default("dark"),
});

monthlyReportPreviewRoute.get(
  "/preview",
  describeRoute({
    description: "Preview a monthly report",
    tags: ["monthly reports"],
    responses: {
      200: {
        description: "Monthly report preview",
        content: { "text/html": { schema: { type: "string" } } },
      },
      404: { description: "Monthly report not found" },
    },
  }),
  validator("query", monthlyReportPreviewQuerySchema),
  (c) => {
    const { mode } = c.req.valid("query");
    const { monthlyReport } = getAppContext();
    if (!monthlyReport) {
      throw new HTTPException(404, { message: "Monthly report was not found" });
    }

    return c.html(
      <MonthlyReportPreview
        mode={mode}
        report={monthlyReport}
      />,
    );
  },
);
