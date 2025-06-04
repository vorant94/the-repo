import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { apiVersions, checkHealth, healthStatuses } from "../../bl/system.ts";
import { createLogger } from "../../shared/logger/logger.ts";

export const systemRoute = new Hono();

const healthDtoSchema = z.object({
  status: z.enum(healthStatuses),
  latestApiVersion: z.enum(apiVersions),
  components: z.object({
    database: z.object({
      status: z.enum(healthStatuses),
    }),
    telegram: z.object({
      username: z.string().nullish(),
      webhookUrl: z.string().url().nullish(),
    }),
  }),
});

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
    // @ts-ignore
    // biome-ignore lint/correctness/noUnusedVariables: testing purposes
    using logger = createLogger("healthRoute");

    const json = healthDtoSchema.parse(await checkHealth());

    return hc.json(json);
  },
);
