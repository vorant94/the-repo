import { Hono } from "hono";
import { ensureRoot } from "../../bl/auth/ensure-root.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";
import { usersRoute } from "./users.route.ts";

export const adminRoute = new Hono<HonoEnv>();

adminRoute.use(ensureRoot);

adminRoute.route("/users", usersRoute);
