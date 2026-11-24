import { and, asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { getAppContext } from "../../../shared/app-context.ts";
import type { HonoEnv } from "../../../shared/hono-env.ts";
import { paginationQuerySchema } from "../../../shared/pagination.ts";
import { getUser } from "../../../shared/permissions.ts";
import {
  eventDtoSchema,
  events,
  insertEventSchema,
  updateEventSchema,
} from "../../../shared/schema/events.ts";
import { ranksRoute } from "./ranks.route.ts";
import { eventReportRoute } from "./report.route.ts";

export const eventsRoute = new Hono<HonoEnv>();

const venueParamSchema = z.object({ venueId: z.uuid() });
const eventParamSchema = venueParamSchema.extend({ id: z.uuid() });
const rankParentParamSchema = venueParamSchema.extend({ eventId: z.uuid() });

eventsRoute.use(
  "/:eventId/*",
  validator("param", rankParentParamSchema),
  async (c, next) => {
    const { venueId, eventId } = rankParentParamSchema.parse(c.req.param());
    const { db } = getAppContext();
    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.hostedBy, venueId)));
    if (!event) {
      throw new HTTPException(404, { message: "Event was not found" });
    }
    await next();
  },
);

eventsRoute.get(
  "/",
  describeRoute({
    description:
      "List events. Requires ownership of this venue or system admin access.",
    tags: ["events"],
    responses: {
      403: { description: "Insufficient permission" },
      400: { description: "Invalid pagination or filters" },
      200: {
        description: "List of events",
        content: {
          "application/json": { schema: resolver(z.array(eventDtoSchema)) },
        },
      },
    },
  }),
  validator("param", venueParamSchema),
  validator("query", paginationQuerySchema),
  async (c) => {
    const { db } = getAppContext();
    const { venueId } = c.req.valid("param");
    const query = c.req.valid("query");
    const { page, pageSize } = query;

    const rawEvents = await db
      .select()
      .from(events)
      .where(eq(events.hostedBy, venueId))
      .orderBy(desc(events.hostedAt), asc(events.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const eventsDto = z.array(eventDtoSchema).parse(rawEvents);

    return c.json(eventsDto);
  },
);

eventsRoute.get(
  "/:id",
  describeRoute({
    description:
      "Get an event by ID. Requires ownership of this venue or system admin access.",
    tags: ["events"],
    responses: {
      403: { description: "Insufficient permission" },
      200: {
        description: "Event",
        content: { "application/json": { schema: resolver(eventDtoSchema) } },
      },
      404: { description: "Event not found" },
    },
  }),
  validator("param", eventParamSchema),
  async (c) => {
    const { db } = getAppContext();
    const { venueId, id } = c.req.valid("param");

    const rawEvents = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.hostedBy, venueId)));
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
    description:
      "Create an event. Requires ownership of this venue or system admin access.",
    tags: ["events"],
    responses: {
      403: { description: "Insufficient permission" },
      201: {
        description: "Created event",
        content: { "application/json": { schema: resolver(eventDtoSchema) } },
      },
      400: { description: "Invalid request body" },
    },
  }),
  validator("param", venueParamSchema),
  validator("json", insertEventSchema),
  async (c) => {
    const { db } = getAppContext();
    const { venueId } = c.req.valid("param");
    const body = c.req.valid("json");
    const userId = getUser().id;

    const rawEvents = await db
      .insert(events)
      .values({
        ...body,
        hostedBy: venueId,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();
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
    description:
      "Update an event. Requires ownership of this venue or system admin access.",
    tags: ["events"],
    responses: {
      403: { description: "Insufficient permission" },
      200: {
        description: "Updated event",
        content: { "application/json": { schema: resolver(eventDtoSchema) } },
      },
      400: { description: "Invalid request body" },
      404: { description: "Event not found" },
    },
  }),
  validator("param", eventParamSchema),
  validator("json", updateEventSchema),
  async (c) => {
    const { db } = getAppContext();
    const { venueId, id } = c.req.valid("param");
    const body = c.req.valid("json");
    const userId = getUser().id;

    const rawEvents = await db
      .update(events)
      .set({ ...body, updatedBy: userId })
      .where(and(eq(events.id, id), eq(events.hostedBy, venueId)))
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
    description:
      "Delete an event. Requires ownership of this venue or system admin access.",
    tags: ["events"],
    responses: {
      403: { description: "Insufficient permission" },
      204: { description: "Deleted event" },
      404: { description: "Event not found" },
    },
  }),
  validator("param", eventParamSchema),
  async (c) => {
    const { db } = getAppContext();
    const { venueId, id } = c.req.valid("param");

    const rawEvents = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.hostedBy, venueId)))
      .returning({ id: events.id });
    const rawEvent = rawEvents.at(0);
    if (!rawEvent) {
      throw new HTTPException(404, { message: "Event was not found" });
    }

    return c.body(null, 204);
  },
);

eventsRoute.route("/:eventId/ranks", ranksRoute);
eventsRoute.route("/:eventId/report", eventReportRoute);
