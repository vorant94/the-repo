import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import { paginationQuerySchema } from "../shared/pagination.ts";
import { jobSchema, jobs } from "../shared/schema/jobs.ts";

export const jobsRoute = new Hono<HonoEnv>();

jobsRoute.get(
  "/",
  describeRoute({
    description: "List jobs",
    tags: ["jobs"],
    responses: {
      400: { description: "Invalid pagination or filters" },
      200: {
        description: "Jobs",
        content: {
          "application/json": { schema: resolver(jobSchema.array()) },
        },
      },
      401: { description: "Unauthorized" },
    },
  }),
  validator("query", paginationQuerySchema),
  async (c) => {
    const { db } = getAppContext();
    const query = c.req.valid("query");
    const { page, pageSize } = query;
    const rawJobs = await db
      .select()
      .from(jobs)
      .orderBy(desc(jobs.createdAt), desc(jobs.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return c.json(jobSchema.array().parse(rawJobs));
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
