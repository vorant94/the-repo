import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import {
  insertRankSchema,
  rankDtoSchema,
  ranks,
  updateRankSchema,
} from "../shared/schema/ranks.ts";

export const ranksRoute = new Hono<HonoEnv>();

ranksRoute.get(
  "/",
  describeRoute({
    description: "List all ranks",
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
  async (c) => {
    const { db } = c.var;

    const rawRanks = await db.select().from(ranks).orderBy(asc(ranks.position));
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
    const { db } = c.var;
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
    const { db } = c.var;
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
    const { db } = c.var;
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
    const { db } = c.var;
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
