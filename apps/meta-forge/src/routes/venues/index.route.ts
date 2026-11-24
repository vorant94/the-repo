import { asc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import { idSchema } from "../../shared/id-schema.ts";
import { paginationQuerySchema } from "../../shared/pagination.ts";
import {
  getUser,
  requireAdmin,
  requireVenueOwner,
} from "../../shared/permissions.ts";
import { venueOwners } from "../../shared/schema/venue-owners.ts";
import {
  insertVenueSchema,
  updateVenueSchema,
  venueDtoSchema,
  venues,
} from "../../shared/schema/venues.ts";
import { eventsRoute } from "./events/index.route.ts";

export const venuesRoute = new Hono<HonoEnv>();

const venueParamSchema = z.object({ venueId: z.uuid() });

venuesRoute.use(
  "/:venueId/*",
  validator("param", venueParamSchema),
  async (c, next) => {
    const { venueId } = venueParamSchema.parse(c.req.param());
    const { db } = getAppContext();
    const [venue] = await db
      .select({ id: venues.id })
      .from(venues)
      .where(eq(venues.id, venueId));
    if (!venue) {
      throw new HTTPException(404, { message: "Venue was not found" });
    }
    await requireVenueOwner(venueId);
    await next();
  },
);

venuesRoute.get(
  "/",
  describeRoute({
    description:
      "List venues. Authenticated users see only venues they own; system admins see all venues.",
    tags: ["venues"],
    responses: {
      400: { description: "Invalid pagination or filters" },
      200: {
        description: "List of venues",
        content: {
          "application/json": { schema: resolver(z.array(venueDtoSchema)) },
        },
      },
    },
  }),
  validator("query", paginationQuerySchema),
  async (c) => {
    const { db } = getAppContext();
    const query = c.req.valid("query");
    const { page, pageSize } = query;
    const user = getUser();
    const ownedVenues = user.isAdmin
      ? null
      : await db
          .select({ id: venueOwners.venueId })
          .from(venueOwners)
          .where(eq(venueOwners.userId, user.id));
    const keys = ownedVenues?.map(({ id }) => id);
    if (keys?.length === 0) {
      return c.json([]);
    }

    const rawVenues = await db
      .select()
      .from(venues)
      .where(keys ? inArray(venues.id, keys) : undefined)
      .orderBy(asc(venues.name), asc(venues.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const venuesDto = z.array(venueDtoSchema).parse(rawVenues);

    return c.json(venuesDto);
  },
);

venuesRoute.get(
  "/:id",
  describeRoute({
    description:
      "Get a venue by ID. Requires ownership of this venue or system admin access.",
    tags: ["venues"],
    responses: {
      403: { description: "Insufficient permission" },
      200: {
        description: "Venue",
        content: { "application/json": { schema: resolver(venueDtoSchema) } },
      },
      404: { description: "Venue not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = getAppContext();
    const { id } = c.req.valid("param");
    await requireVenueOwner(id);

    const rawVenues = await db.select().from(venues).where(eq(venues.id, id));
    const rawVenue = rawVenues.at(0);
    if (!rawVenue) {
      throw new HTTPException(404, { message: "Venue was not found" });
    }
    const venueDto = venueDtoSchema.parse(rawVenue);

    return c.json(venueDto);
  },
);

venuesRoute.post(
  "/",
  describeRoute({
    description: "Create a venue. Requires system admin access.",
    tags: ["venues"],
    responses: {
      403: { description: "Insufficient permission" },
      201: {
        description: "Created venue",
        content: { "application/json": { schema: resolver(venueDtoSchema) } },
      },
      400: { description: "Invalid request body" },
    },
  }),
  validator("json", insertVenueSchema),
  async (c) => {
    const { db } = getAppContext();
    requireAdmin();
    const userId = getUser().id;
    const body = c.req.valid("json");

    const rawVenues = await db
      .insert(venues)
      .values({ ...body, createdBy: userId, updatedBy: userId })
      .returning();
    const rawVenue = rawVenues.at(0);
    if (!rawVenue) {
      throw new Error("Venue insertion returned no record");
    }
    const venueDto = venueDtoSchema.parse(rawVenue);

    return c.json(venueDto, 201);
  },
);

venuesRoute.patch(
  "/:id",
  describeRoute({
    description: "Update a venue. Requires system admin access.",
    tags: ["venues"],
    responses: {
      403: { description: "Insufficient permission" },
      200: {
        description: "Updated venue",
        content: { "application/json": { schema: resolver(venueDtoSchema) } },
      },
      400: { description: "Invalid request body" },
      404: { description: "Venue not found" },
    },
  }),
  validator("param", idSchema),
  validator("json", updateVenueSchema),
  async (c) => {
    const { db } = getAppContext();
    const { id } = c.req.valid("param");
    requireAdmin();
    const body = c.req.valid("json");

    const rawVenues = await db
      .update(venues)
      .set({ ...body, updatedBy: getUser().id })
      .where(eq(venues.id, id))
      .returning();
    const rawVenue = rawVenues.at(0);
    if (!rawVenue) {
      throw new HTTPException(404, { message: "Venue was not found" });
    }
    const venueDto = venueDtoSchema.parse(rawVenue);

    return c.json(venueDto);
  },
);

venuesRoute.delete(
  "/:id",
  describeRoute({
    description: "Delete a venue. Requires system admin access.",
    tags: ["venues"],
    responses: {
      403: { description: "Insufficient permission" },
      204: { description: "Deleted venue" },
      404: { description: "Venue not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = getAppContext();
    const { id } = c.req.valid("param");
    requireAdmin();

    const rawVenues = await db
      .delete(venues)
      .where(eq(venues.id, id))
      .returning({ id: venues.id });
    const rawVenue = rawVenues.at(0);
    if (!rawVenue) {
      throw new HTTPException(404, { message: "Venue was not found" });
    }

    return c.body(null, 204);
  },
);

venuesRoute.route("/:venueId/events", eventsRoute);
