import { sql } from "drizzle-orm";
import { getContext } from "../shared/context/context.ts";
import { NotFoundException } from "../shared/exceptions/not-found.exception.ts";
import type { User } from "../shared/schema/users.ts";

export async function checkHealth(): Promise<Health> {
  const { db, bot, user } = getContext();

  const allSettled = await Promise.allSettled([
    db.run(sql`SELECT 1`).execute(),
    bot.api.getMe(),
    getWebhookUrl(),
  ]);

  const status = allSettled.some((settled) => settled.status === "rejected")
    ? "down"
    : "up";

  const [dbSettled, telegramMeSettled, telegramWebhookSettled] = allSettled;

  return {
    status,
    latestApiVersion: "v1",
    components: {
      database: {
        status: dbSettled.status === "rejected" ? "down" : "up",
      },
      telegram: {
        username:
          telegramMeSettled.status === "rejected"
            ? null
            : telegramMeSettled.value.username,
        webhookUrl:
          telegramWebhookSettled.status === "rejected"
            ? null
            : telegramWebhookSettled.value,
      },
    },
    user,
  };
}

export const healthStatuses = ["up", "down"] as const;
export type HealthStatus = (typeof healthStatuses)[number];

export const apiVersions = ["v1"] as const;
export type ApiVersion = (typeof apiVersions)[number];

export interface Health {
  status: HealthStatus;
  latestApiVersion: ApiVersion;
  components: {
    database: {
      status: HealthStatus;
    };
    telegram: {
      username?: string | null;
      webhookUrl?: string | null;
    };
  };
  user?: User;
}

// bot.api.getWebhookInfo returns url as an empty string if no webhook is set
// it is easier to threat it as an error and throw an exception
async function getWebhookUrl(): Promise<string> {
  const { bot } = getContext();

  const result = await bot.api.getWebhookInfo();
  if (!result.url) {
    throw new NotFoundException("No webhook URL set");
  }

  return result.url;
}
