import { AwsClient } from "aws4fetch";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { runWithAppContext } from "../shared/app-context.ts";
import { envSchema } from "../shared/env.ts";
import { dbConfig } from "../shared/schema/db-config.ts";
import {
  jobSchema,
  jobStatuses,
  jobs,
  jobTypes,
} from "../shared/schema/jobs.ts";
import { generateEventReport } from "./event-report.worker.tsx";
import { generateMonthlyReport } from "./monthly-report.worker.tsx";

const jobMessageSchema = z.object({ jobId: z.uuid() });

export function processJobs(batch: MessageBatch, env: CloudflareBindings) {
  const db = drizzle(env.DB, dbConfig);
  const parsedEnv = envSchema.parse(env);
  const awsClient = new AwsClient({
    service: "s3",
    region: "auto",
    accessKeyId: parsedEnv.R2_ACCESS_KEY_ID,
    secretAccessKey: parsedEnv.R2_SECRET_ACCESS_KEY,
  });

  return runWithAppContext(
    {
      awsClient,
      browser: env.BROWSER,
      bucket: env.BUCKET,
      db,
      env: parsedEnv,
      queue: env.QUEUE,
    },
    async () => {
      for (const message of batch.messages) {
        const { jobId } = jobMessageSchema.parse(message.body);
        const rawJobs = await db.select().from(jobs).where(eq(jobs.id, jobId));
        const rawJob = rawJobs.at(0);
        if (!rawJob) {
          message.ack();
          continue;
        }
        const job = jobSchema.parse(rawJob);
        try {
          await db
            .update(jobs)
            .set({ error: null, status: jobStatuses.generating })
            .where(eq(jobs.id, job.id));
          switch (job.type) {
            case jobTypes.eventReport: {
              const result = await generateEventReport(job);
              await db
                .update(jobs)
                .set({
                  error: null,
                  result,
                  status: jobStatuses.completed,
                })
                .where(eq(jobs.id, job.id));
              break;
            }
            case jobTypes.monthlyReport: {
              const result = await generateMonthlyReport(job);
              await db
                .update(jobs)
                .set({
                  error: null,
                  result,
                  status: jobStatuses.completed,
                })
                .where(eq(jobs.id, job.id));
              break;
            }
          }
          message.ack();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const status =
            message.attempts >= 3 ? jobStatuses.failed : jobStatuses.queued;
          await db
            .update(jobs)
            .set({ error: errorMessage, status })
            .where(eq(jobs.id, job.id));
          if (status === jobStatuses.failed) {
            message.ack();
            continue;
          }
          message.retry();
        }
      }
    },
  );
}
