import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import { findArchetypesByNames } from "../../queries/find-archetypes-by-names.ts";
import { findEventReport } from "../../queries/find-event-report.ts";
import { findPlayersByNames } from "../../queries/find-players-by-names.ts";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import { archetypes } from "../../shared/schema/archetypes.ts";
import { events } from "../../shared/schema/events.ts";
import {
  type EventReportPayload,
  eventReportPayloadSchema,
} from "../../shared/schema/jobs.ts";
import { players } from "../../shared/schema/players.ts";
import { ranks } from "../../shared/schema/ranks.ts";
import { venues } from "../../shared/schema/venues.ts";

export const eventReportCreateRoute = new Hono<HonoEnv>();

const eventReportCreateSchema = eventReportPayloadSchema.omit({ id: true });
type EventReportRank = EventReportPayload["ranks"][number];
// Rank inserts bind 11 values per row; keep each statement below D1's limit.
const maximumRowsPerStatement = 8;

eventReportCreateRoute.post(
  "/",
  describeRoute({
    description: "Create an event report from JSON",
    tags: ["event reports"],
    responses: {
      201: {
        description: "Created event report",
        content: {
          "application/json": { schema: resolver(eventReportPayloadSchema) },
        },
      },
      400: { description: "Invalid event report or venue" },
      401: { description: "Unauthorized" },
    },
  }),
  validator("json", eventReportCreateSchema),
  async (c) => {
    const { db } = getAppContext();
    const {
      name,
      venue,
      hostedAt,
      isLeagueBranded,
      ranks: reportRanks,
    } = c.req.valid("json");
    const rawVenue = await db
      .select()
      .from(venues)
      .where(eq(venues.name, venue.name))
      .then((venues) => venues.at(0));
    if (!rawVenue) {
      throw new HTTPException(400, { message: "Venue was not found" });
    }

    const eventId = crypto.randomUUID();
    const [
      { inserts: playerInserts, idsByName: playerIdsByName },
      { inserts: archetypeInserts, idsByName: archetypeIdsByName },
    ] = await Promise.all([
      preparePlayers(reportRanks),
      prepareArchetypes(reportRanks),
    ]);
    const rankInserts = prepareRanks(
      reportRanks,
      eventId,
      playerIdsByName,
      archetypeIdsByName,
    );

    await db.batch([
      db.insert(events).values({
        id: eventId,
        name,
        hostedAt,
        hostedBy: rawVenue.id,
        isLeagueBranded,
      }),
      ...playerInserts,
      ...archetypeInserts,
      ...rankInserts,
    ]);

    const eventReportDto = await findEventReport(eventId);
    if (!eventReportDto) {
      throw new Error("Event insertion returned no record");
    }

    return c.json(eventReportDto, 201);
  },
);

async function preparePlayers(reportRanks: Array<EventReportRank>) {
  const { db } = getAppContext();
  const names = new Set(reportRanks.map((rank) => rank.player.name));
  const idsByName = await findPlayersByNames([...names]);
  const values = [...names].flatMap((name) => {
    if (idsByName.has(name)) {
      return [];
    }

    const id = crypto.randomUUID();
    idsByName.set(name, id);
    return [{ id, name }];
  });

  return {
    idsByName,
    inserts: splitIntoChunks(values).map((chunk) =>
      db.insert(players).values(chunk),
    ),
  };
}

async function prepareArchetypes(reportRanks: Array<EventReportRank>) {
  const { db } = getAppContext();
  const names = new Set(reportRanks.map((rank) => rank.archetype.name));
  const idsByName = await findArchetypesByNames([...names]);
  const values = [...names].flatMap((name) => {
    if (idsByName.has(name)) {
      return [];
    }

    const id = crypto.randomUUID();
    idsByName.set(name, id);
    return [{ id, name }];
  });

  return {
    idsByName,
    inserts: splitIntoChunks(values).map((chunk) =>
      db.insert(archetypes).values(chunk),
    ),
  };
}

function prepareRanks(
  reportRanks: Array<EventReportRank>,
  eventId: string,
  playerIdsByName: Map<string, string>,
  archetypeIdsByName: Map<string, string>,
) {
  const { db } = getAppContext();
  const values = reportRanks.map((rank) => {
    const playerId = playerIdsByName.get(rank.player.name);
    const archetypeId = archetypeIdsByName.get(rank.archetype.name);
    if (!playerId || !archetypeId) {
      throw new Error("Could not resolve report player or archetype");
    }

    return {
      eventId,
      playerId,
      archetypeId,
      position: rank.position,
      wins: rank.wins,
      losses: rank.losses,
      draws: rank.draws,
      isArchetypeHidden: rank.isArchetypeHidden,
    };
  });

  return splitIntoChunks(values).map((chunk) => db.insert(ranks).values(chunk));
}

function splitIntoChunks<Value>(values: Array<Value>): Array<Array<Value>> {
  const chunks: Array<Array<Value>> = [];
  for (let index = 0; index < values.length; index += maximumRowsPerStatement) {
    chunks.push(values.slice(index, index + maximumRowsPerStatement));
  }

  return chunks;
}
