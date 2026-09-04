import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import {
  insertPlayerSchema,
  playerDtoSchema,
  players,
  updatePlayerSchema,
} from "../shared/schema/players.ts";

export const playersRoute = new Hono<HonoEnv>();

playersRoute.get(
  "/",
  describeRoute({
    description: "List all players",
    tags: ["players"],
    responses: {
      200: {
        description: "List of players",
        content: {
          "application/json": { schema: resolver(z.array(playerDtoSchema)) },
        },
      },
    },
  }),
  async (c) => {
    const { db } = c.var;

    const rawPlayers = await db
      .select()
      .from(players)
      .orderBy(asc(players.name));
    const playersDto = z.array(playerDtoSchema).parse(rawPlayers);

    return c.json(playersDto);
  },
);

playersRoute.get(
  "/:id",
  describeRoute({
    description: "Get a player by ID",
    tags: ["players"],
    responses: {
      200: {
        description: "Player",
        content: { "application/json": { schema: resolver(playerDtoSchema) } },
      },
      404: { description: "Player not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");

    const rawPlayers = await db
      .select()
      .from(players)
      .where(eq(players.id, id));
    const rawPlayer = rawPlayers.at(0);
    if (!rawPlayer) {
      throw new HTTPException(404, { message: "Player was not found" });
    }
    const playerDto = playerDtoSchema.parse(rawPlayer);

    return c.json(playerDto);
  },
);

playersRoute.post(
  "/",
  describeRoute({
    description: "Create a player",
    tags: ["players"],
    responses: {
      201: {
        description: "Created player",
        content: { "application/json": { schema: resolver(playerDtoSchema) } },
      },
      400: { description: "Invalid request body" },
    },
  }),
  validator("json", insertPlayerSchema),
  async (c) => {
    const { db } = c.var;
    const body = c.req.valid("json");

    const rawPlayers = await db.insert(players).values(body).returning();
    const rawPlayer = rawPlayers.at(0);
    if (!rawPlayer) {
      throw new Error("Player insertion returned no record");
    }
    const playerDto = playerDtoSchema.parse(rawPlayer);

    return c.json(playerDto, 201);
  },
);

playersRoute.patch(
  "/:id",
  describeRoute({
    description: "Update a player",
    tags: ["players"],
    responses: {
      200: {
        description: "Updated player",
        content: { "application/json": { schema: resolver(playerDtoSchema) } },
      },
      400: { description: "Invalid request body" },
      404: { description: "Player not found" },
    },
  }),
  validator("param", idSchema),
  validator("json", updatePlayerSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const rawPlayers = await db
      .update(players)
      .set(body)
      .where(eq(players.id, id))
      .returning();
    const rawPlayer = rawPlayers.at(0);
    if (!rawPlayer) {
      throw new HTTPException(404, { message: "Player was not found" });
    }
    const playerDto = playerDtoSchema.parse(rawPlayer);

    return c.json(playerDto);
  },
);

playersRoute.delete(
  "/:id",
  describeRoute({
    description: "Delete a player",
    tags: ["players"],
    responses: {
      204: { description: "Deleted player" },
      404: { description: "Player not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { db } = c.var;
    const { id } = c.req.valid("param");

    const rawPlayers = await db
      .delete(players)
      .where(eq(players.id, id))
      .returning({ id: players.id });
    const rawPlayer = rawPlayers.at(0);
    if (!rawPlayer) {
      throw new HTTPException(404, { message: "Player was not found" });
    }

    return c.body(null, 204);
  },
);
