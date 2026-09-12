import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { monthlyReportCityNameSchema } from "../monthly-report-city.ts";

export const jobTypes = {
  eventReport: "event-report",
  monthlyReport: "monthly-report",
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
export type Job = z.infer<typeof jobSchema>;

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
  .meta({ ref: "EventReportPayload" });
export type EventReportPayload = z.infer<typeof eventReportPayloadSchema>;

export const monthlyReportHostSchema = z.object({
  city: monthlyReportCityNameSchema.nullable(),
  eventCount: z.number().int().nonnegative(),
  name: z.string(),
});
export type MonthlyReportHost = z.infer<typeof monthlyReportHostSchema>;

export const monthlyReportCitySummarySchema = z.object({
  archetypeCount: z.number().int().nonnegative(),
  largeEventCount: z.number().int().nonnegative(),
  eventCount: z.number().int().nonnegative(),
  hostCount: z.number().int().nonnegative(),
  mediumEventCount: z.number().int().nonnegative(),
  name: monthlyReportCityNameSchema,
  playerCount: z.number().int().nonnegative(),
  smallEventCount: z.number().int().nonnegative(),
});
export type MonthlyReportCitySummary = z.infer<
  typeof monthlyReportCitySummarySchema
>;

export const monthlyReportPayloadSchema = z
  .object({
    cities: monthlyReportCitySummarySchema.array(),
    month: z.iso.date(),
    hosts: monthlyReportHostSchema.array(),
  })
  .meta({ ref: "MonthlyReportPayload" });
export type MonthlyReportPayload = z.infer<typeof monthlyReportPayloadSchema>;

export const reportResultSchema = z.object({ objectKey: z.string() });

const eventReportResultSchema = reportResultSchema.meta({
  ref: "EventReportResult",
});

const monthlyReportResultSchema = reportResultSchema.meta({
  ref: "MonthlyReportResult",
});

export const eventReportJobSchema = jobSchema
  .extend({
    type: z.literal(jobTypes.eventReport),
    payload: eventReportPayloadSchema,
    result: eventReportResultSchema.nullable(),
  })
  .meta({ ref: "EventReportJob" });

export const monthlyReportJobSchema = jobSchema
  .extend({
    type: z.literal(jobTypes.monthlyReport),
    payload: monthlyReportPayloadSchema,
    result: monthlyReportResultSchema.nullable(),
  })
  .meta({ ref: "MonthlyReportJob" });
