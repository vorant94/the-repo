import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import {
  insertVenueSchema,
  updateVenueSchema,
  venueDtoSchema,
  venues,
} from "../shared/schema/venues.ts";

export const venuesRoute = new Hono<HonoEnv>();

venuesRoute.get(
  "/",
  describeRoute({
    description: "List all venues",
    tags: ["venues"],
    responses: {
      200: {
        description: "List of venues",
        content: {
          "application/json": { schema: resolver(z.array(venueDtoSchema)) },
        },
      },
    },
  }),
  async (c) => {
    const { db } = getAppContext();

    const rawVenues = await db.select().from(venues).orderBy(asc(venues.name));
    const venuesDto = z.array(venueDtoSchema).parse(rawVenues);

    return c.json(venuesDto);
  },
);

venuesRoute.get(
  "/:id",
  describeRoute({
    description: "Get a venue by ID",
    tags: ["venues"],
    responses: {
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
    description: "Create a venue",
    tags: ["venues"],
    responses: {
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
    const body = c.req.valid("json");

    const rawVenues = await db.insert(venues).values(body).returning();
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
    description: "Update a venue",
    tags: ["venues"],
    responses: {
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
    const body = c.req.valid("json");

    const rawVenues = await db
      .update(venues)
      .set(body)
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
    description: "Delete a venue",
    tags: ["venues"],
    responses: {
      204: { description: "Deleted venue" },
      404: { description: "Venue not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = getAppContext();
    const { id } = c.req.valid("param");

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
