import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver } from "hono-openapi";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import {
  jobStatuses,
  jobs,
  jobTypes,
  monthlyReportJobSchema,
} from "../../shared/schema/jobs.ts";

export const monthlyReportGenerateRoute = new Hono<HonoEnv>();

monthlyReportGenerateRoute.post(
  "/generate",
  describeRoute({
    description: "Queue a monthly report screenshot generation",
    tags: ["monthly reports"],
    responses: {
      202: {
        description: "Queued monthly report generation",
        content: {
          "application/json": { schema: resolver(monthlyReportJobSchema) },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Monthly report was not found" },
    },
  }),
  async (c) => {
    const { db, monthlyReport, queue } = getAppContext();
    if (!monthlyReport) {
      throw new HTTPException(404, { message: "Monthly report was not found" });
    }

    const jobsRows = await db
      .insert(jobs)
      .values({
        id: crypto.randomUUID(),
        type: jobTypes.monthlyReport,
        status: jobStatuses.queued,
        payload: monthlyReport,
        result: null,
        error: null,
      })
      .returning();
    const job = jobsRows.at(0);
    if (!job) {
      throw new Error("Job insertion returned no record");
    }

    await queue.send({ jobId: job.id });

    return c.json(monthlyReportJobSchema.parse(job), 202);
  },
);
