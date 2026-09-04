import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import {
  archetypeDtoSchema,
  archetypes,
  insertArchetypeSchema,
  updateArchetypeSchema,
} from "../shared/schema/archetypes.ts";

export const archetypesRoute = new Hono<HonoEnv>();

archetypesRoute.get(
  "/",
  describeRoute({
    description: "List all archetypes",
    tags: ["archetypes"],
    responses: {
      200: {
        description: "List of archetypes",
        content: {
          "application/json": {
            schema: resolver(z.array(archetypeDtoSchema)),
          },
        },
      },
    },
  }),
  async (c) => {
    const { db } = c.var;

    const rawArchetypes = await db
      .select()
      .from(archetypes)
      .orderBy(asc(archetypes.name));
    const archetypesDto = z.array(archetypeDtoSchema).parse(rawArchetypes);

    return c.json(archetypesDto);
  },
);

archetypesRoute.get(
  "/:id",
  describeRoute({
    description: "Get an archetype by ID",
    tags: ["archetypes"],
    responses: {
      200: {
        description: "Archetype",
        content: {
          "application/json": { schema: resolver(archetypeDtoSchema) },
        },
      },
      404: { description: "Archetype not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");

    const rawArchetypes = await db
      .select()
      .from(archetypes)
      .where(eq(archetypes.id, id));
    const rawArchetype = rawArchetypes.at(0);
    if (!rawArchetype) {
      throw new HTTPException(404, { message: "Archetype was not found" });
    }
    const archetypeDto = archetypeDtoSchema.parse(rawArchetype);

    return c.json(archetypeDto);
  },
);

archetypesRoute.post(
  "/",
  describeRoute({
    description: "Create an archetype",
    tags: ["archetypes"],
    responses: {
      201: {
        description: "Created archetype",
        content: {
          "application/json": { schema: resolver(archetypeDtoSchema) },
        },
      },
      400: { description: "Invalid request body" },
    },
  }),
  validator("json", insertArchetypeSchema),
  async (c) => {
    const { db } = c.var;
    const body = c.req.valid("json");

    const rawArchetypes = await db.insert(archetypes).values(body).returning();
    const rawArchetype = rawArchetypes.at(0);
    if (!rawArchetype) {
      throw new Error("Archetype insertion returned no record");
    }
    const archetypeDto = archetypeDtoSchema.parse(rawArchetype);

    return c.json(archetypeDto, 201);
  },
);

archetypesRoute.patch(
  "/:id",
  describeRoute({
    description: "Update an archetype",
    tags: ["archetypes"],
    responses: {
      200: {
        description: "Updated archetype",
        content: {
          "application/json": { schema: resolver(archetypeDtoSchema) },
        },
      },
      400: { description: "Invalid request body" },
      404: { description: "Archetype not found" },
    },
  }),
  validator("param", idSchema),
  validator("json", updateArchetypeSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const rawArchetypes = await db
      .update(archetypes)
      .set(body)
      .where(eq(archetypes.id, id))
      .returning();
    const rawArchetype = rawArchetypes.at(0);
    if (!rawArchetype) {
      throw new HTTPException(404, { message: "Archetype was not found" });
    }
    const archetypeDto = archetypeDtoSchema.parse(rawArchetype);

    return c.json(archetypeDto);
  },
);

archetypesRoute.delete(
  "/:id",
  describeRoute({
    description: "Delete an archetype",
    tags: ["archetypes"],
    responses: {
      204: { description: "Deleted archetype" },
      404: { description: "Archetype not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");

    const rawArchetypes = await db
      .delete(archetypes)
      .where(eq(archetypes.id, id))
      .returning({ id: archetypes.id });
    const rawArchetype = rawArchetypes.at(0);
    if (!rawArchetype) {
      throw new HTTPException(404, { message: "Archetype was not found" });
    }

    return c.body(null, 204);
  },
);
