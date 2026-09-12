import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { openAPIRouteHandler } from "hono-openapi";
import { appContextMiddleware } from "./middlewares/app-context.middleware.ts";
import { jwtMiddleware } from "./middlewares/jwt.middleware.ts";
import { archetypesRoute } from "./routes/archetypes.route.ts";
import { bucketRoute } from "./routes/bucket.route.ts";
import { eventReportsRoute } from "./routes/event-reports/index.route.ts";
import { eventsRoute } from "./routes/events.route.ts";
import { hostsRoute } from "./routes/hosts.route.ts";
import { jobsRoute } from "./routes/jobs.route.ts";
import { linksRoute } from "./routes/links.route.ts";
import { monthlyReportsRoute } from "./routes/monthly-reports/index.route.ts";
import { playersRoute } from "./routes/players.route.ts";
import { ranksRoute } from "./routes/ranks.route.ts";
import type { HonoEnv } from "./shared/hono-env.ts";
import { processJobs } from "./workers/index.ts";

const app = new Hono<HonoEnv>();

app.use(cors());
app.use(appContextMiddleware);
const publicApiPaths = ["/api/docs", "/api/openapi.json"];
if (import.meta.env.DEV) {
  publicApiPaths.push("/api/event-reports/*/preview");
  publicApiPaths.push("/api/monthly-reports/*/preview");
  publicApiPaths.push("/api/bucket/*");
}

app.use("/api/*", except(publicApiPaths, jwtMiddleware));

app.get("/", (c) => c.redirect("/api/docs"));
app.route("/ln", linksRoute);
app.route("/api/hosts", hostsRoute);
app.route("/api/jobs", jobsRoute);
app.route("/api/players", playersRoute);
app.route("/api/archetypes", archetypesRoute);
app.route("/api/events", eventsRoute);
app.route("/api/ranks", ranksRoute);
app.route("/api/event-reports", eventReportsRoute);
app.route("/api/monthly-reports", monthlyReportsRoute);
if (import.meta.env.DEV) {
  app.route("/api/bucket", bucketRoute);
}
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

export default {
  fetch: app.fetch,
  queue: processJobs,
} satisfies ExportedHandler<CloudflareBindings>;
