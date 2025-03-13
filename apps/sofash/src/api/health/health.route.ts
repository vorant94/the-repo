import { checkHealth, healthStatuses } from "@/bl/system/check-health.ts";
import { createLogger } from "@/shared/logger/logger.ts";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";

export const healthRoute = new Hono();

const healthDtoSchema = z.object({
  status: z.enum(healthStatuses),
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

healthRoute.get(
  "/",
  describeRoute({
    description: "Check the health of the system",
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
