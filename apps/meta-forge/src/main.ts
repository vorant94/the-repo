import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { except } from "hono/combine";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { openAPIRouteHandler } from "hono-openapi";
import { dbMiddleware } from "./middlewares/db.middleware.ts";
import { envMiddleware } from "./middlewares/env.middleware.ts";
import { jwtMiddleware } from "./middlewares/jwt.middleware.ts";
import { archetypesRoute } from "./routes/archetypes.route.ts";
import { eventReportsRoute } from "./routes/event-reports.route.ts";
import { eventsRoute } from "./routes/events.route.ts";
import { hostsRoute } from "./routes/hosts.route.ts";
import { playersRoute } from "./routes/players.route.ts";
import { ranksRoute } from "./routes/ranks.route.ts";
import type { HonoEnv } from "./shared/hono-env.ts";

const app = new Hono<HonoEnv>();

app.use(contextStorage());
app.use(cors());
app.use(envMiddleware);
app.use(dbMiddleware);
app.use("/api/*", except(["/api/docs", "/api/openapi.json"], jwtMiddleware));

app.get("/", (c) => c.redirect("/api/docs"));
app.route("/api/hosts", hostsRoute);
app.route("/api/players", playersRoute);
app.route("/api/archetypes", archetypesRoute);
app.route("/api/events", eventsRoute);
app.route("/api/ranks", ranksRoute);
app.route("/api/event-reports", eventReportsRoute);
app.get(
  "/api/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Meta Forge API",
        version: "1.0.0",
        description: "Pauper event-report data API",
      },
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  }),
);
app.get("/api/docs", swaggerUI({ url: "/api/openapi.json" }));

export default app;
