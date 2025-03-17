import type { HonoEnv } from "@/shared/env/hono-env.ts";
import { catchError } from "@/shared/lib/error-or/catch-error.ts";
import type { Constructor } from "@/shared/lib/error-or/constructor.ts";
import type { User } from "@/shared/schema/users.ts";
import type { ResultSet } from "@libsql/client";
import { sql } from "drizzle-orm";
import { getContext } from "hono/context-storage";

export async function checkHealth(): Promise<Health> {
  const { db, bot, user } = getContext<HonoEnv>().var;

  const [dbResolved, telegramMeResolved, telegramWebhookResolved] =
    await Promise.all([
      // cannot infer union generic from overloaded function
      // see https://github.com/microsoft/TypeScript/issues/44312
      catchError<ResultSet | D1Result<unknown>, Constructor<Error>>(
        db.run(sql`SELECT 1`).execute(),
      ),
      catchError(bot.api.getMe()),
      catchError(getWebhookUrl()),
    ]);
  const [dbError] = dbResolved;
  const [telegramMeError, telegramMeResult] = telegramMeResolved;
  const [telegramWebhookUrlError, telegramWebhookUrlResult] =
    telegramWebhookResolved;

  const status = [dbError, telegramMeError, telegramWebhookUrlError].some(
    Boolean,
  )
    ? "down"
    : "up";

  return {
    status,
    components: {
      database: {
        status: dbError ? "down" : "up",
      },
      telegram: {
        username: telegramMeError ? null : telegramMeResult.username,
        webhookUrl: telegramWebhookUrlError ? null : telegramWebhookUrlResult,
      },
    },
    user,
  };
}

export const healthStatuses = ["up", "down"] as const;
export type HealthStatus = (typeof healthStatuses)[number];

export interface Health {
  status: HealthStatus;
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
  const { bot } = getContext<HonoEnv>().var;

  const result = await bot.api.getWebhookInfo();
  if (!result.url) {
    throw new Error("No webhook URL set");
  }

  return result.url;
}
