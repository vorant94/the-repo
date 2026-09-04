import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import {
  hostDtoSchema,
  hosts,
  insertHostSchema,
  updateHostSchema,
} from "../shared/schema/hosts.ts";

export const hostsRoute = new Hono<HonoEnv>();

hostsRoute.get(
  "/",
  describeRoute({
    description: "List all hosts",
    tags: ["hosts"],
    responses: {
      200: {
        description: "List of hosts",
        content: {
          "application/json": { schema: resolver(z.array(hostDtoSchema)) },
        },
      },
    },
  }),
  async (c) => {
    const { db } = c.var;

    const rawHosts = await db.select().from(hosts).orderBy(asc(hosts.name));
    const hostsDto = z.array(hostDtoSchema).parse(rawHosts);

    return c.json(hostsDto);
  },
);

hostsRoute.get(
  "/:id",
  describeRoute({
    description: "Get a host by ID",
    tags: ["hosts"],
    responses: {
      200: {
        description: "Host",
        content: { "application/json": { schema: resolver(hostDtoSchema) } },
      },
      404: { description: "Host not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");

    const rawHosts = await db.select().from(hosts).where(eq(hosts.id, id));
    const rawHost = rawHosts.at(0);
    if (!rawHost) {
      throw new HTTPException(404, { message: "Host was not found" });
    }
    const hostDto = hostDtoSchema.parse(rawHost);

    return c.json(hostDto);
  },
);

hostsRoute.post(
  "/",
  describeRoute({
    description: "Create a host",
    tags: ["hosts"],
    responses: {
      201: {
        description: "Created host",
        content: { "application/json": { schema: resolver(hostDtoSchema) } },
      },
      400: { description: "Invalid request body" },
    },
  }),
  validator("json", insertHostSchema),
  async (c) => {
    const { db } = c.var;
    const body = c.req.valid("json");

    const rawHosts = await db.insert(hosts).values(body).returning();
    const rawHost = rawHosts.at(0);
    if (!rawHost) {
      throw new Error("Host insertion returned no record");
    }
    const hostDto = hostDtoSchema.parse(rawHost);

    return c.json(hostDto, 201);
  },
);

hostsRoute.patch(
  "/:id",
  describeRoute({
    description: "Update a host",
    tags: ["hosts"],
    responses: {
      200: {
        description: "Updated host",
        content: { "application/json": { schema: resolver(hostDtoSchema) } },
      },
      400: { description: "Invalid request body" },
      404: { description: "Host not found" },
    },
  }),
  validator("param", idSchema),
  validator("json", updateHostSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const rawHosts = await db
      .update(hosts)
      .set(body)
      .where(eq(hosts.id, id))
      .returning();
    const rawHost = rawHosts.at(0);
    if (!rawHost) {
      throw new HTTPException(404, { message: "Host was not found" });
    }
    const hostDto = hostDtoSchema.parse(rawHost);

    return c.json(hostDto);
  },
);

hostsRoute.delete(
  "/:id",
  describeRoute({
    description: "Delete a host",
    tags: ["hosts"],
    responses: {
      204: { description: "Deleted host" },
      404: { description: "Host not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");

    const rawHosts = await db
      .delete(hosts)
      .where(eq(hosts.id, id))
      .returning({ id: hosts.id });
    const rawHost = rawHosts.at(0);
    if (!rawHost) {
      throw new HTTPException(404, { message: "Host was not found" });
    }

    return c.body(null, 204);
  },
);
