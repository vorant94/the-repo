import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver } from "hono-openapi";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import {
  eventReportJobSchema,
  jobStatuses,
  jobs,
  jobTypes,
} from "../../shared/schema/jobs.ts";

export const eventReportGenerateRoute = new Hono<HonoEnv>();

eventReportGenerateRoute.post(
  "/generate",
  describeRoute({
    description: "Queue an event report screenshot generation",
    tags: ["event reports"],
    responses: {
      202: {
        description: "Queued event report generation",
        content: {
          "application/json": { schema: resolver(eventReportJobSchema) },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Event report was not found" },
    },
  }),
  async (c) => {
    const { db, eventReport, queue } = getAppContext();
    if (!eventReport) {
      throw new HTTPException(404, { message: "Event report was not found" });
    }

    const jobsRows = await db
      .insert(jobs)
      .values({
        id: crypto.randomUUID(),
        type: jobTypes.eventReport,
        status: jobStatuses.queued,
        payload: eventReport,
        result: null,
        error: null,
      })
      .returning();
    const job = jobsRows.at(0);
    if (!job) {
      throw new Error("Job insertion returned no record");
    }

    await queue.send({ jobId: job.id });

    return c.json(eventReportJobSchema.parse(job), 202);
  },
);
