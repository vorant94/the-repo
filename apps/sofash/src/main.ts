import { randomUUID } from "node:crypto";
import { conversations } from "@grammyjs/conversations";
import { swaggerUI } from "@hono/swagger-ui";
import { Bot, session } from "grammy";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { env } from "hono/adapter";
import { contextStorage } from "hono/context-storage";
import { adminRoute } from "./api/admin/admin.route.ts";
import { healthRoute } from "./api/health/health.route.ts";
import { telegramRoute } from "./api/telegram/telegram.route.ts";
import { auth } from "./bl/auth/auth.ts";
import { configSchema } from "./shared/env/config.ts";
import type { GrammyContext } from "./shared/env/grammy-context.ts";
import type { HonoEnv } from "./shared/env/hono-env.ts";
import { dbConfig } from "./shared/schema/db-config.ts";

if (import.meta.env.DEV) {
  // dotenv needed during development to set env locally from process.env
  // instead of vite's import.meta.env with all its restrictions (like VITE_ prefix)
  // so hono's env helper can get env from process.env like it does with node runtime
  const { config } = await import("dotenv");
  config();
}

const app = new Hono<HonoEnv>();

app.use(contextStorage(), async (hc, next) => {
  hc.set("requestId", randomUUID());

  const config = configSchema.parse(env(hc));
  hc.set("config", config);

  const bot = new Bot<GrammyContext>(config.BOT_TOKEN);
  bot.use(auth);
  bot.use(session());
  bot.use(conversations());
  hc.set("bot", bot);

  if (import.meta.env.DEV) {
    const { drizzle } = await import("drizzle-orm/libsql");
    hc.set("db", drizzle(config.DB_FILE_NAME, dbConfig));
  } else {
    const { drizzle } = await import("drizzle-orm/d1");
    hc.set("db", drizzle(hc.env.DB, dbConfig));
  }

  await next();
});

app.route("/admin", adminRoute);
app.route("/health", healthRoute);
// cannot set this path to be secret since in CF secrets are accessed only
// inside request. the same goes for creating a bot instance outside of request
// scope since token is a secret that is accessible only inside request
app.route("/telegram", telegramRoute);

app.get(
  "/openapi.json",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Sofash",
        version: "0.0.1",
        description: "Sofash API",
      },
      servers: [
        {
          url: "http://localhost:5173",
          description: "Local server",
        },
      ],
      components: {
        securitySchemes: {
          basicAuth: {
            type: "http",
            scheme: "basic",
          },
        },
      },
    },
  }),
);

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

export default app;
