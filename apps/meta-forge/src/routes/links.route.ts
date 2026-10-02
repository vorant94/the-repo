import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import {
  eventReportResultSchema,
  jobStatuses,
  jobs,
  jobTypes,
} from "../shared/schema/jobs.ts";

const bucketName = "meta-forge";
const signedUrlLifetimeSeconds = 60 * 60;
const linkParamsSchema = idSchema.extend({
  page: z.coerce.number().int().positive().optional(),
});

export const linksRoute = new Hono<HonoEnv>();

linksRoute.get(
  "/:id/:page?",
  describeRoute({
    description: "Redirect to a generated report image page",
    tags: ["links"],
    security: [],
    responses: {
      302: { description: "Redirect to the report image" },
      404: { description: "Link was not found" },
    },
  }),
  validator("param", linkParamsSchema),
  async (c) => {
    const { awsClient, db, env } = getAppContext();
    const { id, page } = c.req.valid("param");
    const pageNumber = page ?? 1;

    const rawJobs = await db
      .select({ result: jobs.result })
      .from(jobs)
      .where(
        and(
          eq(jobs.id, id),
          inArray(jobs.type, [jobTypes.eventReport, jobTypes.monthlyReport]),
          eq(jobs.status, jobStatuses.completed),
        ),
      );
    const job = rawJobs.at(0);
    if (!job) {
      throw new HTTPException(404, { message: "Link was not found" });
    }

    const result = eventReportResultSchema.parse(job.result);
    const pages = "objectKey" in result ? [result] : result.pages;
    const reportPage = pages.at(pageNumber - 1);
    if (!reportPage) {
      throw new HTTPException(404, { message: "Report page was not found" });
    }
    const { objectKey } = reportPage;
    if (import.meta.env.DEV) {
      return c.redirect(
        new URL(`/api/bucket/${objectKey}`, c.req.url).toString(),
      );
    }
    const url = new URL(
      `/${bucketName}/${objectKey}`,
      `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    );
    url.searchParams.set("X-Amz-Expires", signedUrlLifetimeSeconds.toString());
    const signedRequest = await awsClient.sign(
      new Request(url, { method: "GET" }),
      {
        aws: { signQuery: true },
      },
    );

    return c.redirect(signedRequest.url);
  },
);
