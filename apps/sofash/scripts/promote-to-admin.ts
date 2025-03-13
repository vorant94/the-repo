import { inspect, parseArgs } from "node:util";
import { config } from "dotenv";
import { z } from "zod";
import { configSchema } from "../src/shared/env/config.ts";

const { id, baseUrl } = z
  .object({
    id: z.string().uuid(),
    baseUrl: z.string().url().default("http://localhost:5173"),
  })
  .parse(
    parseArgs({
      options: {
        id: {
          type: "string",
        },
        baseUrl: {
          type: "string",
        },
      },
    }).values,
  );

const env = configSchema
  .pick({
    // biome-ignore lint/style/useNamingConvention: env variables have different convention
    ADMIN_USERNAME: true,
    // biome-ignore lint/style/useNamingConvention: env variables have different convention
    ADMIN_PASSWORD: true,
  })
  .parse(config().parsed);

const response = await fetch(
  new URL(`/admin/users/${id}/promote-to-admin`, baseUrl),
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // biome-ignore lint/style/useNamingConvention: headers have different convention
      Authorization: `Basic ${Buffer.from(`${env.ADMIN_USERNAME}:${env.ADMIN_PASSWORD}`).toString("base64")}`,
    },
  },
);

const body = await response.json();

console.info(
  inspect(body, {
    depth: Number.POSITIVE_INFINITY,
    colors: true,
    maxArrayLength: Number.POSITIVE_INFINITY,
  }),
);
