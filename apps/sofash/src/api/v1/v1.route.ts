import { Hono } from "hono";
import { chainsRoute } from "./chains.route.ts";
import { systemRoute } from "./system.route.ts";
import { usersRoute } from "./users.route.ts";

export const v1Route = new Hono();

v1Route.route("/users", usersRoute);
v1Route.route("/system", systemRoute);
v1Route.route("/chains", chainsRoute);
