import { Hono } from "hono";
import { chainsRoute } from "./chains.route.ts";
import { sitesRoute } from "./sites.route.ts";
import { systemRoute } from "./system.route.ts";
import { titlesRoute } from "./titles.route.ts";
import { usersRoute } from "./users.route.ts";

export const v1Route = new Hono();

v1Route.route("/users", usersRoute);
v1Route.route("/system", systemRoute);
v1Route.route("/chains", chainsRoute);
v1Route.route("/sites", sitesRoute);
v1Route.route("/titles", titlesRoute);
