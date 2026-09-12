import type { Context, Next } from "hono";
import { Hono } from "hono";
import { z } from "zod";
import { findMonthlyReport } from "../../queries/find-monthly-report.ts";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import { monthlyReportGenerateRoute } from "./generate.route.ts";
import { monthlyReportGetRoute } from "./get.route.ts";
import { monthlyReportPreviewRoute } from "./preview.route.tsx";

export const monthlyReportsRoute = new Hono<HonoEnv>();

const monthlyReportMonthSchema = z.object({
  month: z.iso.date().refine((month) => month.endsWith("-01"), {
    message: "Month must be the first day of the target month",
  }),
});

monthlyReportsRoute.use("/:month", monthlyReportMiddleware);
monthlyReportsRoute.use("/:month/*", monthlyReportMiddleware);
monthlyReportsRoute.route("/:month", monthlyReportGetRoute);
monthlyReportsRoute.route("/:month", monthlyReportGenerateRoute);
if (import.meta.env.DEV) {
  monthlyReportsRoute.route("/:month", monthlyReportPreviewRoute);
}

async function monthlyReportMiddleware(c: Context<HonoEnv>, next: Next) {
  const { month } = monthlyReportMonthSchema.parse(c.req.param());
  const monthlyReport = await findMonthlyReport(month);

  getAppContext().monthlyReport = monthlyReport;
  await next();
}
