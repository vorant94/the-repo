import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { apiVersions, checkHealth, healthStatuses } from "../../bl/system.ts";

export const systemRoute = new Hono();

const healthStatusDtoSchema = z
  .enum(healthStatuses)
  .openapi({ ref: "HealthStatusDto" });

const apiVersionDtoSchema = z
  .enum(apiVersions)
  .openapi({ ref: "ApiVersionDto" });

const healthDtoSchema = z
  .object({
    status: healthStatusDtoSchema,
    latestApiVersion: apiVersionDtoSchema,
    components: z.object({
      database: z.object({
        status: healthStatusDtoSchema,
      }),
      telegram: z.object({
        username: z.string().nullish(),
        webhookUrl: z.string().url().nullish(),
      }),
    }),
  })
  .openapi({ ref: "HealthDto" });

systemRoute.get(
  "/health",
  describeRoute({
    description: "Check the health of the system",
    tags: ["system"],
    responses: {
      200: {
        description: "Health check",
        content: {
          "application/json": {
            schema: resolver(healthDtoSchema),
          },
        },
      },
    },
  }),
  async (hc) => {
    const json = healthDtoSchema.parse(await checkHealth());

    return hc.json(json);
  },
);
