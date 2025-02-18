import { Hono } from "hono";
import { hOnlyAdmins } from "../../bl/auth/only-admins.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";
import { usersRoute } from "./users.route.ts";

export const adminRoute = new Hono<HonoEnv>();

adminRoute.use(hOnlyAdmins);

adminRoute.route("/users", usersRoute);
