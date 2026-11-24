import { asc, eq, inArray, like, or } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import { paginationQuerySchema } from "../shared/pagination.ts";
import { getUser, requireAdmin } from "../shared/permissions.ts";
import {
  archetypeDtoSchema,
  archetypes,
  insertArchetypeSchema,
  updateArchetypeSchema,
} from "../shared/schema/archetypes.ts";
import { ranks } from "../shared/schema/ranks.ts";

export const archetypesRoute = new Hono<HonoEnv>();

archetypesRoute.use("/*", async (_c, next) => {
  requireAdmin();
  await next();
});

archetypesRoute.get(
  "/",
  describeRoute({
    description:
      "List archetypes, optionally filtered by a case-insensitive partial name or alias. Requires system admin access.",
    tags: ["archetypes"],
    responses: {
      403: { description: "Insufficient permission" },
      400: { description: "Invalid pagination or filters" },
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
  validator(
    "query",
    paginationQuerySchema.extend({
      name: z
        .string()
        .optional()
        .describe("Case-insensitive partial match against the name or aliases"),
    }),
  ),
  async (c) => {
    const { db } = getAppContext();
    const { name, page, pageSize } = c.req.valid("query");
    const namePattern = `%${name}%`;
    const rawArchetypes = await db
      .select()
      .from(archetypes)
      .where(
        name
          ? or(
              like(archetypes.name, namePattern),
              like(archetypes.aliases, namePattern),
            )
          : undefined,
      )
      .orderBy(asc(archetypes.name), asc(archetypes.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const archetypesDto = z.array(archetypeDtoSchema).parse(rawArchetypes);

    return c.json(archetypesDto);
  },
);

archetypesRoute.get(
  "/:id",
  describeRoute({
    description: "Get an archetype by ID. Requires system admin access.",
    tags: ["archetypes"],
    responses: {
      403: { description: "Insufficient permission" },
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
    const { db } = getAppContext();
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
    description: "Create an archetype. Requires system admin access.",
    tags: ["archetypes"],
    responses: {
      403: { description: "Insufficient permission" },
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
    const { db } = getAppContext();
    const userId = getUser().id;
    const body = c.req.valid("json");

    const rawArchetypes = await db
      .insert(archetypes)
      .values({ ...body, createdBy: userId, updatedBy: userId })
      .returning();
    const rawArchetype = rawArchetypes.at(0);
    if (!rawArchetype) {
      throw new Error("Archetype insertion returned no record");
    }
    const archetypeDto = archetypeDtoSchema.parse(rawArchetype);

    return c.json(archetypeDto, 201);
  },
);

archetypesRoute.post(
  "/:id/reconcile",
  describeRoute({
    description:
      "Merge another archetype into this archetype. Requires system admin access.",
    tags: ["archetypes"],
    responses: {
      403: { description: "Insufficient permission" },
      200: {
        description: "Reconciled archetype",
        content: {
          "application/json": { schema: resolver(archetypeDtoSchema) },
        },
      },
      400: { description: "Invalid request body or matching archetype IDs" },
      404: { description: "Archetype not found" },
    },
  }),
  validator("param", idSchema),
  validator("json", idSchema),
  async (c) => {
    const { db } = getAppContext();
    const { id } = c.req.valid("param");
    const { id: duplicateId } = c.req.valid("json");
    if (id === duplicateId) {
      throw new HTTPException(400, {
        message: "An archetype cannot be reconciled with itself",
      });
    }

    const rawArchetypes = await db
      .select()
      .from(archetypes)
      .where(inArray(archetypes.id, [id, duplicateId]));
    const rawArchetype = rawArchetypes.find((archetype) => archetype.id === id);
    if (!rawArchetype) {
      throw new HTTPException(404, { message: "Archetype was not found" });
    }
    const rawDuplicate = rawArchetypes.find(
      (archetype) => archetype.id === duplicateId,
    );
    if (!rawDuplicate) {
      throw new HTTPException(404, {
        message: "Duplicate archetype was not found",
      });
    }

    const aliases = new Set(rawArchetype.aliases);
    aliases.add(rawDuplicate.name);
    const aliasValues = [...aliases];
    const updateRankReferences = db
      .update(ranks)
      .set({ archetypeId: id, updatedBy: getUser().id })
      .where(eq(ranks.archetypeId, duplicateId));
    const updateArchetype = db
      .update(archetypes)
      .set({ aliases: aliasValues, updatedBy: getUser().id })
      .where(eq(archetypes.id, id))
      .returning();
    const deleteDuplicate = db
      .delete(archetypes)
      .where(eq(archetypes.id, duplicateId));
    const [, updatedArchetypes] = await db.batch([
      updateRankReferences,
      updateArchetype,
      deleteDuplicate,
    ]);
    const updatedArchetype = updatedArchetypes.at(0);
    if (!updatedArchetype) {
      throw new Error("Archetype reconciliation returned no record");
    }
    const archetypeDto = archetypeDtoSchema.parse(updatedArchetype);

    return c.json(archetypeDto);
  },
);

archetypesRoute.patch(
  "/:id",
  describeRoute({
    description: "Update an archetype. Requires system admin access.",
    tags: ["archetypes"],
    responses: {
      403: { description: "Insufficient permission" },
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
    const { db } = getAppContext();
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const rawArchetypes = await db
      .update(archetypes)
      .set({ ...body, updatedBy: getUser().id })
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
    description: "Delete an archetype. Requires system admin access.",
    tags: ["archetypes"],
    responses: {
      403: { description: "Insufficient permission" },
      204: { description: "Deleted archetype" },
      404: { description: "Archetype not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = getAppContext();
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
