import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver } from "hono-openapi";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import { jobSchema, jobs } from "../shared/schema/jobs.ts";

export const jobsRoute = new Hono<HonoEnv>();

jobsRoute.get(
  "/",
  describeRoute({
    description: "List jobs",
    tags: ["jobs"],
    responses: {
      200: {
        description: "Jobs",
        content: {
          "application/json": { schema: resolver(jobSchema.array()) },
        },
      },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const { db } = getAppContext();
    const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));

    return c.json(jobSchema.array().parse(allJobs));
  },
);

jobsRoute.get(
  "/:id",
  describeRoute({
    description: "Get a job",
    tags: ["jobs"],
    responses: {
      200: {
        description: "Job",
        content: { "application/json": { schema: resolver(jobSchema) } },
      },
      401: { description: "Unauthorized" },
      404: { description: "Job was not found" },
    },
  }),
  async (c) => {
    const { db } = getAppContext();
    const { id } = idSchema.parse(c.req.param());
    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .then((rows) => rows.at(0));
    if (!job) {
      throw new HTTPException(404, { message: "Job was not found" });
    }

    return c.json(jobSchema.parse(job));
  },
);
