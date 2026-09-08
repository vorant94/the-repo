import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, validator } from "hono-openapi";
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

export const linksRoute = new Hono<HonoEnv>();

linksRoute.get(
  "/:id",
  describeRoute({
    description: "Redirect to a generated event-report image",
    tags: ["links"],
    security: [],
    responses: {
      302: { description: "Redirect to the event-report image" },
      404: { description: "Link was not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { awsClient, db, env } = getAppContext();
    const { id } = c.req.valid("param");

    const rawJobs = await db
      .select({ result: jobs.result })
      .from(jobs)
      .where(
        and(
          eq(jobs.id, id),
          eq(jobs.type, jobTypes.eventReport),
          eq(jobs.status, jobStatuses.completed),
        ),
      );
    const job = rawJobs.at(0);
    if (!job) {
      throw new HTTPException(404, { message: "Link was not found" });
    }

    const result = eventReportResultSchema.parse(job.result);
    if (import.meta.env.DEV) {
      return c.redirect(
        new URL(`/api/bucket/${result.objectKey}`, c.req.url).toString(),
      );
    }
    const url = new URL(
      `/${bucketName}/${result.objectKey}`,
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
