import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";
import { requireAdmin } from "../shared/permissions.ts";
import { users } from "../shared/schema/users.ts";
import { venueOwners } from "../shared/schema/venue-owners.ts";
import { venues } from "../shared/schema/venues.ts";

export const venueOwnersRoute = new Hono<HonoEnv>();

const venueOwnerParamsSchema = z.object({
  venueId: z.uuid(),
  userId: z.uuid(),
});
const venueOwnerQuerySchema = z.object({ venueId: z.uuid().optional() });

venueOwnersRoute.use("/*", async (_c, next) => {
  requireAdmin();
  await next();
});

venueOwnersRoute.get(
  "/",
  describeRoute({
    tags: ["venue owners"],
    description:
      "List venue owners, optionally filtered by venue ID. Requires system admin access.",
    responses: {
      403: { description: "Insufficient permission" },
      200: { description: "Venue owners" },
    },
  }),
  validator("query", venueOwnerQuerySchema),
  async (c) => {
    const { db } = getAppContext();
    const { venueId } = c.req.valid("query");
    const rows = await db
      .select({ venueId: venueOwners.venueId, userId: venueOwners.userId })
      .from(venueOwners)
      .where(venueId ? eq(venueOwners.venueId, venueId) : undefined);
    return c.json(rows);
  },
);

venueOwnersRoute.put(
  "/:venueId/:userId",
  describeRoute({
    tags: ["venue owners"],
    description: "Add a venue owner. Requires system admin access.",
    responses: {
      403: { description: "Insufficient permission" },
      200: { description: "Venue owner added" },
    },
  }),
  validator("param", venueOwnerParamsSchema),
  async (c) => {
    const { db } = getAppContext();
    const { venueId, userId } = c.req.valid("param");
    const [venue] = await db
      .select({ id: venues.id })
      .from(venues)
      .where(eq(venues.id, venueId));
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId));
    if (!venue || !user) {
      throw new HTTPException(404, { message: "Venue or user was not found" });
    }
    await db
      .insert(venueOwners)
      .values({ venueId, userId })
      .onConflictDoNothing();
    return c.json({ venueId, userId });
  },
);

venueOwnersRoute.delete(
  "/:venueId/:userId",
  describeRoute({
    tags: ["venue owners"],
    description: "Remove a venue owner. Requires system admin access.",
    responses: {
      403: { description: "Insufficient permission" },
      204: { description: "Venue owner removed" },
    },
  }),
  validator("param", venueOwnerParamsSchema),
  async (c) => {
    const { db } = getAppContext();
    const { venueId, userId } = c.req.valid("param");
    const [row] = await db
      .delete(venueOwners)
      .where(
        and(eq(venueOwners.venueId, venueId), eq(venueOwners.userId, userId)),
      )
      .returning({ userId: venueOwners.userId });
    if (!row) {
      throw new HTTPException(404, { message: "Venue owner was not found" });
    }
    return c.body(null, 204);
  },
);
