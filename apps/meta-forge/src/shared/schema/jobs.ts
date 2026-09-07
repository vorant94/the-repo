import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const eventReportPayloadSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    hostedAt: z.iso.datetime({ offset: true }),
    host: z.object({ name: z.string(), address: z.string() }),
    ranks: z.array(
      z.object({
        position: z.number().int().positive(),
        wins: z.number().int().nonnegative(),
        losses: z.number().int().nonnegative(),
        draws: z.number().int().nonnegative(),
        isArchetypeHidden: z.boolean().nullable(),
        player: z.object({ name: z.string() }),
        archetype: z.object({ name: z.string() }),
      }),
    ),
  })
  .meta({ ref: "EventReport" });
export type EventReport = z.infer<typeof eventReportPayloadSchema>;

export const jobTypes = {
  eventReport: "event-report",
} as const;
export type JobType = (typeof jobTypes)[keyof typeof jobTypes];

export const jobStatuses = {
  queued: "queued",
  generating: "generating",
  completed: "completed",
  failed: "failed",
} as const;
export type JobStatus = (typeof jobStatuses)[keyof typeof jobStatuses];

export const jobs = sqliteTable("jobs", {
  id: text().primaryKey(),
  createdAt: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text()
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdateFn(() => new Date().toISOString()),
  type: text({
    enum: Object.values(jobTypes) as [JobType, ...Array<JobType>],
  })
    .notNull()
    .default(jobTypes.eventReport),
  status: text({
    enum: Object.values(jobStatuses) as [JobStatus, ...Array<JobStatus>],
  }).notNull(),
  payload: text({ mode: "json" }).$type<unknown>().notNull(),
  result: text({ mode: "json" }).$type<unknown>(),
  error: text(),
});

export const jobSchema = createSelectSchema(jobs).meta({ ref: "Job" });

export const eventReportJobSchema = jobSchema
  .extend({
    type: z.literal(jobTypes.eventReport),
    payload: eventReportPayloadSchema,
    result: z.object({ objectKey: z.string() }).nullable(),
  })
  .meta({ ref: "EventReportJob" });
export type EventReportJob = z.infer<typeof eventReportJobSchema>;
