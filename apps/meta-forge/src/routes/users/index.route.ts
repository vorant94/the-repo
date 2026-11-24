import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import { idSchema } from "../../shared/id-schema.ts";
import { requireAdmin } from "../../shared/permissions.ts";
import { users } from "../../shared/schema/users.ts";
import { apiTokensRoute } from "./api-tokens.route.ts";

export const usersRoute = new Hono<HonoEnv>();

const createUserSchema = z.object({ name: z.string() });
const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

usersRoute.use("/*", async (_c, next) => {
  requireAdmin();
  await next();
});

usersRoute.get(
  "/",
  describeRoute({
    tags: ["users"],
    description: "List users. Requires system admin access.",
    responses: {
      403: { description: "Insufficient permission" },
      200: { description: "Users" },
    },
  }),
  async (c) => {
    const { db } = getAppContext();
    const usersList = await db.select().from(users);
    return c.json(usersList);
  },
);

usersRoute.post(
  "/",
  describeRoute({
    tags: ["users"],
    description: "Create a user. Requires system admin access.",
    responses: {
      403: { description: "Insufficient permission" },
      201: { description: "Created user" },
    },
  }),
  validator("json", createUserSchema),
  async (c) => {
    const { db } = getAppContext();
    const [user] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: c.req.valid("json").name,
        createdAt: new Date().toISOString(),
      })
      .returning();
    if (!user) {
      throw new Error("User insertion returned no record");
    }
    return c.json(user, 201);
  },
);

usersRoute.patch(
  "/:id",
  describeRoute({
    tags: ["users"],
    description: "Activate or deactivate a user. Requires system admin access.",
    responses: {
      403: { description: "Insufficient permission" },
      200: { description: "Updated user" },
    },
  }),
  validator("param", idSchema),
  validator("json", updateUserSchema),
  async (c) => {
    const { db } = getAppContext();
    const [user] = await db
      .update(users)
      .set(c.req.valid("json"))
      .where(eq(users.id, c.req.valid("param").id))
      .returning();
    if (!user) {
      throw new HTTPException(404, { message: "User was not found" });
    }
    return c.json(user);
  },
);

usersRoute.route("/:userId/api-tokens", apiTokensRoute);
