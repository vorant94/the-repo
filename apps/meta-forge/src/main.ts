import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { openAPIRouteHandler } from "hono-openapi";
import { appContextMiddleware } from "./middlewares/app-context.middleware.ts";
import { tokenMiddleware } from "./middlewares/token.middleware.ts";
import { archetypesRoute } from "./routes/archetypes.route.ts";
import { bucketRoute } from "./routes/bucket.route.ts";
import { jobsRoute } from "./routes/jobs.route.ts";
import { linksRoute } from "./routes/links.route.ts";
import { monthlyReportsRoute } from "./routes/monthly-reports/index.route.ts";
import { playersRoute } from "./routes/players.route.ts";
import { usersRoute } from "./routes/users/index.route.ts";
import { venueOwnersRoute } from "./routes/venue-owners.route.ts";
import { venuesRoute } from "./routes/venues/index.route.ts";
import type { HonoEnv } from "./shared/hono-env.ts";
import { processJobs } from "./workers/index.ts";

const app = new Hono<HonoEnv>();

app.use(cors());
app.use(appContextMiddleware);
const publicApiPaths = ["/api/docs", "/api/openapi.json"];
if (import.meta.env.DEV) {
  publicApiPaths.push("/api/bucket/*");
}

app.use("/api/*", except(publicApiPaths, tokenMiddleware));

app.get("/", (c) => c.redirect("/api/docs"));
app.route("/ln", linksRoute);
app.route("/api/venues", venuesRoute);
app.route("/api/venue-owners", venueOwnersRoute);
app.route("/api/users", usersRoute);
app.route("/api/jobs", jobsRoute);
app.route("/api/players", playersRoute);
app.route("/api/archetypes", archetypesRoute);
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
        description:
          "Pauper event-report data API. Tokens identify users. Venue owners can access their venues and manage their events and ranks. System admins manage venues, users, ownership, players, archetypes, jobs, and monthly reports. Permissions come from venue ownership or admin status.",
      },
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            description: "Individual, revocable Meta Forge API token",
          },
        },
      },
    },
  }),
);
app.get(
  "/api/docs",
  Scalar({
    agent: { disabled: true },
    darkMode: true,
    persistAuth: true,
    url: "/api/openapi.json",
  }),
);

export default {
  fetch: app.fetch,
  queue: processJobs,
} satisfies ExportedHandler<CloudflareBindings>;
