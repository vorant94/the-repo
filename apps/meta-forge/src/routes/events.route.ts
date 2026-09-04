import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import {
  eventDtoSchema,
  events,
  insertEventSchema,
  updateEventSchema,
} from "../shared/schema/events.ts";

export const eventsRoute = new Hono<HonoEnv>();

eventsRoute.get(
  "/",
  describeRoute({
    description: "List all events",
    tags: ["events"],
    responses: {
      200: {
        description: "List of events",
        content: {
          "application/json": { schema: resolver(z.array(eventDtoSchema)) },
        },
      },
    },
  }),
  async (c) => {
    const { db } = c.var;

    const rawEvents = await db
      .select()
      .from(events)
      .orderBy(asc(events.hostedAt));
    const eventsDto = z.array(eventDtoSchema).parse(rawEvents);

    return c.json(eventsDto);
  },
);

eventsRoute.get(
  "/:id",
  describeRoute({
    description: "Get an event by ID",
    tags: ["events"],
    responses: {
      200: {
        description: "Event",
        content: { "application/json": { schema: resolver(eventDtoSchema) } },
      },
      404: { description: "Event not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");

    const rawEvents = await db.select().from(events).where(eq(events.id, id));
    const rawEvent = rawEvents.at(0);
    if (!rawEvent) {
      throw new HTTPException(404, { message: "Event was not found" });
    }
    const eventDto = eventDtoSchema.parse(rawEvent);

    return c.json(eventDto);
  },
);

eventsRoute.post(
  "/",
  describeRoute({
    description: "Create an event",
    tags: ["events"],
    responses: {
      201: {
        description: "Created event",
        content: { "application/json": { schema: resolver(eventDtoSchema) } },
      },
      400: { description: "Invalid request body" },
    },
  }),
  validator("json", insertEventSchema),
  async (c) => {
    const { db } = c.var;
    const body = c.req.valid("json");

    const rawEvents = await db.insert(events).values(body).returning();
    const rawEvent = rawEvents.at(0);
    if (!rawEvent) {
      throw new Error("Event insertion returned no record");
    }
    const eventDto = eventDtoSchema.parse(rawEvent);

    return c.json(eventDto, 201);
  },
);

eventsRoute.patch(
  "/:id",
  describeRoute({
    description: "Update an event",
    tags: ["events"],
    responses: {
      200: {
        description: "Updated event",
        content: { "application/json": { schema: resolver(eventDtoSchema) } },
      },
      400: { description: "Invalid request body" },
      404: { description: "Event not found" },
    },
  }),
  validator("param", idSchema),
  validator("json", updateEventSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const rawEvents = await db
      .update(events)
      .set(body)
      .where(eq(events.id, id))
      .returning();
    const rawEvent = rawEvents.at(0);
    if (!rawEvent) {
      throw new HTTPException(404, { message: "Event was not found" });
    }
    const eventDto = eventDtoSchema.parse(rawEvent);

    return c.json(eventDto);
  },
);

eventsRoute.delete(
  "/:id",
  describeRoute({
    description: "Delete an event",
    tags: ["events"],
    responses: {
      204: { description: "Deleted event" },
      404: { description: "Event not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");

    const rawEvents = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning({ id: events.id });
    const rawEvent = rawEvents.at(0);
    if (!rawEvent) {
      throw new HTTPException(404, { message: "Event was not found" });
    }

    return c.body(null, 204);
  },
);
