import { z } from "zod";

const playerSchema = z.object({ id: z.string(), name: z.string() });

const archetypeSchema = z.object({ id: z.string(), name: z.string() });

const hostSchema = z.object({
  address: z.string(),
  id: z.string(),
  name: z.string(),
});

const resultSchema = z.object({
  draws: z.number().optional(),
  loses: z.number(),
  wins: z.number(),
});

const standingSchema = z.object({
  archetypeId: z.string(),
  playerId: z.string(),
  result: resultSchema,
});

const eventSchema = z.object({
  date: z.string(),
  hostId: z.string(),
  id: z.string(),
  name: z.string(),
  standings: z.array(standingSchema),
});

export const eventReportDataSchema = z.object({
  archetypes: z.array(archetypeSchema),
  events: z.array(eventSchema),
  hosts: z.array(hostSchema),
  players: z.array(playerSchema),
});
