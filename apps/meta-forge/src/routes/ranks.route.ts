import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { findArchetypesByNames } from "../queries/find-archetypes-by-names.ts";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import { archetypes } from "../shared/schema/archetypes.ts";
import {
  insertRankSchema,
  rankDtoSchema,
  ranks,
  updateRankSchema,
} from "../shared/schema/ranks.ts";

export const ranksRoute = new Hono<HonoEnv>();

const ranksQuerySchema = z.object({
  archetypeId: z.uuid().optional(),
  eventId: z.uuid().optional(),
});

const fixRankSchema = z.object({
  archetypeName: z.string().optional(),
  isArchetypeHidden: z.boolean().optional(),
});

ranksRoute.get(
  "/",
  describeRoute({
    description: "List ranks, optionally filtered by archetype and event IDs",
    tags: ["ranks"],
    responses: {
      200: {
        description: "List of ranks",
        content: {
          "application/json": { schema: resolver(z.array(rankDtoSchema)) },
        },
      },
    },
  }),
  validator("query", ranksQuerySchema),
  async (c) => {
    const { db } = getAppContext();
    const { archetypeId, eventId } = c.req.valid("query");

    const rawRanks = await db
      .select()
      .from(ranks)
      .where(
        and(
          archetypeId ? eq(ranks.archetypeId, archetypeId) : undefined,
          eventId ? eq(ranks.eventId, eventId) : undefined,
        ),
      )
      .orderBy(asc(ranks.position));
    const ranksDto = z.array(rankDtoSchema).parse(rawRanks);

    return c.json(ranksDto);
  },
);

ranksRoute.get(
  "/:id",
  describeRoute({
    description: "Get a rank by ID",
    tags: ["ranks"],
    responses: {
      200: {
        description: "Rank",
        content: { "application/json": { schema: resolver(rankDtoSchema) } },
      },
      404: { description: "Rank not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = getAppContext();
    const { id } = c.req.valid("param");

    const rawRanks = await db.select().from(ranks).where(eq(ranks.id, id));
    const rawRank = rawRanks.at(0);
    if (!rawRank) {
      throw new HTTPException(404, { message: "Rank was not found" });
    }
    const rankDto = rankDtoSchema.parse(rawRank);

    return c.json(rankDto);
  },
);

ranksRoute.post(
  "/",
  describeRoute({
    description: "Create a rank",
    tags: ["ranks"],
    responses: {
      201: {
        description: "Created rank",
        content: { "application/json": { schema: resolver(rankDtoSchema) } },
      },
      400: { description: "Invalid request body" },
    },
  }),
  validator("json", insertRankSchema),
  async (c) => {
    const { db } = getAppContext();
    const body = c.req.valid("json");

    const rawRanks = await db.insert(ranks).values(body).returning();
    const rawRank = rawRanks.at(0);
    if (!rawRank) {
      throw new Error("Rank insertion returned no record");
    }
    const rankDto = rankDtoSchema.parse(rawRank);

    return c.json(rankDto, 201);
  },
);

ranksRoute.patch(
  "/:id",
  describeRoute({
    description: "Update a rank",
    tags: ["ranks"],
    responses: {
      200: {
        description: "Updated rank",
        content: { "application/json": { schema: resolver(rankDtoSchema) } },
      },
      400: { description: "Invalid request body" },
      404: { description: "Rank not found" },
    },
  }),
  validator("param", idSchema),
  validator("json", updateRankSchema),
  async (c) => {
    const { db } = getAppContext();
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const rawRanks = await db
      .update(ranks)
      .set(body)
      .where(eq(ranks.id, id))
      .returning();
    const rawRank = rawRanks.at(0);
    if (!rawRank) {
      throw new HTTPException(404, { message: "Rank was not found" });
    }
    const rankDto = rankDtoSchema.parse(rawRank);

    return c.json(rankDto);
  },
);

ranksRoute.patch(
  "/:id/fix",
  describeRoute({
    description: "Fix a rank's archetype by name or visibility",
    tags: ["ranks"],
    responses: {
      200: {
        description: "Updated rank",
        content: { "application/json": { schema: resolver(rankDtoSchema) } },
      },
      400: { description: "Invalid request body" },
      404: { description: "Rank not found" },
    },
  }),
  validator("param", idSchema),
  validator("json", fixRankSchema),
  async (c) => {
    const { db } = getAppContext();
    const { id } = c.req.valid("param");
    const { archetypeName, isArchetypeHidden } = c.req.valid("json");

    const existingRanks = await db
      .select({ id: ranks.id })
      .from(ranks)
      .where(eq(ranks.id, id));
    if (!existingRanks.at(0)) {
      throw new HTTPException(404, { message: "Rank was not found" });
    }

    let archetypeId: string | undefined;
    if (archetypeName !== undefined) {
      const matchingIds = await findArchetypesByNames([archetypeName]);
      const matchingId = matchingIds.get(archetypeName);
      if (matchingId) {
        archetypeId = matchingId;
      } else {
        const createdArchetypes = await db
          .insert(archetypes)
          .values({ name: archetypeName })
          .returning({ id: archetypes.id });
        const createdArchetype = createdArchetypes.at(0);
        if (!createdArchetype) {
          throw new Error("Archetype insertion returned no record");
        }
        archetypeId = createdArchetype.id;
      }
    }

    const rawRanks = await db
      .update(ranks)
      .set({ archetypeId, isArchetypeHidden })
      .where(eq(ranks.id, id))
      .returning();
    const rawRank = rawRanks.at(0);
    if (!rawRank) {
      throw new HTTPException(404, { message: "Rank was not found" });
    }
    const rankDto = rankDtoSchema.parse(rawRank);

    return c.json(rankDto);
  },
);

ranksRoute.delete(
  "/:id",
  describeRoute({
    description: "Delete a rank",
    tags: ["ranks"],
    responses: {
      204: { description: "Deleted rank" },
      404: { description: "Rank not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = getAppContext();
    const { id } = c.req.valid("param");

    const rawRanks = await db
      .delete(ranks)
      .where(eq(ranks.id, id))
      .returning({ id: ranks.id });
    const rawRank = rawRanks.at(0);
    if (!rawRank) {
      throw new HTTPException(404, { message: "Rank was not found" });
    }

    return c.body(null, 204);
  },
);
