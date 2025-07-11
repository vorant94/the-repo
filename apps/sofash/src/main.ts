import "zod-openapi/extend";
import { conversations } from "@grammyjs/conversations";
import { swaggerUI } from "@hono/swagger-ui";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { Bot, session } from "grammy";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";
import { openAPISpecs } from "hono-openapi";
import { ensureUserMiddleware } from "./api/telegram/ensure-user.middleware.ts";
import { telegramRoute } from "./api/telegram/telegram.route.ts";
import { v1Route } from "./api/v1/v1.route.ts";
import { configSchema } from "./shared/context/config.ts";
import {
  getContext,
  runWithinContext,
  runWithinPatchedContext,
} from "./shared/context/context.ts";
import type { HonoEnv } from "./shared/env/hono-env.ts";
import { createLogger } from "./shared/logger/logger.ts";
import { dbConfig } from "./shared/schema/db-config.ts";
import type { GrammyContext } from "./shared/telegram/grammy-context.ts";

if (import.meta.env.DEV) {
  // dotenv needed during development to set env locally from process.env
  // instead of vite's import.meta.env with all its restrictions (like VITE_ prefix)
  // so hono's env helper can get env from process.env like it does with node runtime
  const { config } = await import("dotenv");
  config();
}

// cannot use basePath /api here since I want to redirect root route
// (without /api) to /api/docs, therefore all "real" routes have /api prefix
// set up manually
const app = new Hono<HonoEnv>();

app.use(cors());

app.use((hc, next) =>
  runWithinContext({}, async () => {
    using logger = createLogger("main");

    const config = configSchema.parse(env(hc));
    logger.info("config successfully parsed");

    const bot = new Bot<GrammyContext>(config.BOT_TOKEN);
    bot.use(ensureUserMiddleware);
    bot.use(session());
    bot.use(conversations());
    logger.info("bot instance successfully created");

    let db: DrizzleD1Database | LibSQLDatabase;
    if (import.meta.env.DEV) {
      const { drizzle } = await import("drizzle-orm/libsql");
      db = drizzle(config.DB_FILE_NAME, dbConfig);
      logger.info("db client (libsql) successfully created");
    } else {
      const { drizzle } = await import("drizzle-orm/d1");
      db = drizzle(hc.env.DB, dbConfig);
      logger.info("db client (d1) successfully created");
    }

    await runWithinPatchedContext({ config, bot, db }, async () => {
      logger.info("context is successfully initiated");

      const { requestId } = getContext();
      hc.res.headers.set("X-Request-Id", requestId);

      hc.res.headers.set("X-Server-Date-Time", new Date().toISOString());

      const start = Date.now();
      await next();
      const end = Date.now();

      hc.res.headers.set("X-Response-Time-Ms", `${end - start}`);
    });
  }),
);

app.get("/", (hc) => hc.redirect("/api/docs"));

app.route("/api/v1", v1Route);
// cannot set this path to be secret since in CF secrets are accessed only
// inside request. the same goes for creating a bot instance outside of request
// scope since token is a secret that is accessible only inside request
app.route("/api/telegram", telegramRoute);

app.get(
  "/api/openapi.json",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Sofash",
        version: "1.0.0",
        description: "Sofash API",
      },
      servers: [
        {
          url: "http://localhost:5173",
          description: "Local server",
        },
        {
          url: "https://sofash.vorant94.workers.dev",
          description: "Production worker",
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

app.get(
  "/api/docs",
  swaggerUI({ url: "/api/openapi.json", persistAuthorization: true }),
);

export default app;
