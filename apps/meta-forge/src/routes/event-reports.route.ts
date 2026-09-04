import { asc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { getContext } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import Papa from "papaparse";
import { z } from "zod";
import type { HonoEnv } from "../shared/hono-env.ts";
import { idSchema } from "../shared/id-schema.ts";
import { archetypes } from "../shared/schema/archetypes.ts";
import { events } from "../shared/schema/events.ts";
import { hosts } from "../shared/schema/hosts.ts";
import { players } from "../shared/schema/players.ts";
import { ranks } from "../shared/schema/ranks.ts";

export const eventReportsRoute = new Hono<HonoEnv>();

const eventReportImportFormSchema = z.object({
  eventName: z.string(),
  hostName: z.string(),
  eventDate: z.iso.datetime({ offset: true }),
  report: z.instanceof(File),
});

const eventReportRowSchema = z.object({
  rank: z.coerce.number().int().positive(),
  player: z.string(),
  archetype: z.string(),
  wins: z.coerce.number().int().nonnegative(),
  losses: z.coerce.number().int().nonnegative(),
  draws: z.coerce.number().int().nonnegative().optional(),
});
type EventReportRow = z.infer<typeof eventReportRowSchema>;

const expectedHeaders = [
  "rank",
  "player",
  "archetype",
  "wins",
  "losses",
  "draws",
];
const maximumRowsPerStatement = 10;

const eventReportDtoSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    hostedAt: z.iso.datetime({ offset: true }),
    host: z.object({
      name: z.string(),
      address: z.string(),
    }),
    ranks: z.array(
      z.object({
        position: z.number().int().positive(),
        wins: z.number().int().nonnegative(),
        losses: z.number().int().nonnegative(),
        draws: z.number().int().nonnegative(),
        player: z.object({ name: z.string() }),
        archetype: z.object({ name: z.string() }),
      }),
    ),
  })
  .meta({ ref: "EventReport" });

eventReportsRoute.post(
  "/import",
  describeRoute({
    description: "Import an event report from a CSV file",
    tags: ["event reports"],
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            required: ["eventName", "hostName", "eventDate", "report"],
            properties: {
              eventName: { type: "string" },
              hostName: { type: "string" },
              eventDate: { type: "string", format: "date-time" },
              report: { type: "string", format: "binary" },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "Imported event report",
        content: {
          "application/json": {
            schema: resolver(eventReportDtoSchema),
          },
        },
      },
      400: { description: "Invalid multipart data, CSV report, or host" },
      401: { description: "Unauthorized" },
    },
  }),
  validator("form", eventReportImportFormSchema, undefined, {
    media: "multipart/form-data",
  }),
  async (c) => {
    const { db } = c.var;
    const body = c.req.valid("form");
    const { eventName, hostName, eventDate, report } = body;

    const rawReport = await report.text();
    const rows = parseEventReport(rawReport);

    const rawHosts = await db
      .select()
      .from(hosts)
      .where(eq(hosts.name, hostName));
    const rawHost = rawHosts.at(0);
    if (!rawHost) {
      throw new HTTPException(400, { message: "Host was not found" });
    }

    const eventId = crypto.randomUUID();
    const { inserts: playerInserts, idsByName: playerIdsByName } =
      await preparePlayers(rows);
    const { inserts: archetypeInserts, idsByName: archetypeIdsByName } =
      await prepareArchetypes(rows);
    const rankInserts = prepareRanks(
      rows,
      eventId,
      playerIdsByName,
      archetypeIdsByName,
    );

    // D1 executes the statements in a batch sequentially and atomically.
    await db.batch([
      db.insert(events).values({
        id: eventId,
        name: eventName,
        hostedAt: eventDate,
        hostedBy: rawHost.id,
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

eventReportsRoute.get(
  "/:id",
  describeRoute({
    description: "Get an event report with its host and standings",
    tags: ["event reports"],
    responses: {
      200: {
        description: "Event report",
        content: {
          "application/json": { schema: resolver(eventReportDtoSchema) },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Event report not found" },
    },
  }),
  validator("param", idSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const eventReportDto = await findEventReport(id);
    if (!eventReportDto) {
      throw new HTTPException(404, { message: "Event report was not found" });
    }

    return c.json(eventReportDto);
  },
);

async function findEventReport(id: string) {
  const { db } = getContext<HonoEnv>().var;

  const rawEventReportRows = await db
    .select({
      event: {
        id: events.id,
        name: events.name,
        hostedAt: events.hostedAt,
      },
      host: {
        name: hosts.name,
        address: hosts.address,
      },
      rank: {
        position: ranks.position,
        wins: ranks.wins,
        losses: ranks.losses,
        draws: ranks.draws,
      },
      player: { name: players.name },
      archetype: { name: archetypes.name },
    })
    .from(events)
    .innerJoin(hosts, eq(events.hostedBy, hosts.id))
    .leftJoin(ranks, eq(ranks.eventId, events.id))
    .leftJoin(players, eq(ranks.playerId, players.id))
    .leftJoin(archetypes, eq(ranks.archetypeId, archetypes.id))
    .where(eq(events.id, id))
    .orderBy(asc(ranks.position));
  const rawEventReport = rawEventReportRows.at(0);
  if (!rawEventReport) {
    return null;
  }

  const ranksDto = rawEventReportRows.flatMap((rawRow) => {
    const { rank, player, archetype } = rawRow;
    if (!rank || !player || !archetype) {
      return [];
    }

    return [{ ...rank, player, archetype }];
  });

  return eventReportDtoSchema.parse({
    ...rawEventReport.event,
    host: rawEventReport.host,
    ranks: ranksDto,
  });
}

function parseEventReport(report: string): Array<EventReportRow> {
  const parsedReport = Papa.parse<Record<string, string>>(report, {
    header: true,
    skipEmptyLines: true,
  });
  const { data: rawRows, errors, meta } = parsedReport;

  if (!meta.fields || meta.fields.join(",") !== expectedHeaders.join(",")) {
    throw new HTTPException(400, {
      message: `Expected CSV columns: ${expectedHeaders.join(", ")}`,
    });
  }

  const firstError = errors.at(0);
  if (firstError) {
    throw new HTTPException(400, {
      message: `Invalid CSV row ${(firstError.row ?? 0) + 2}`,
    });
  }

  return rawRows.map((rawRow) => eventReportRowSchema.parse(rawRow));
}

async function preparePlayers(rows: Array<EventReportRow>) {
  const { db } = getContext<HonoEnv>().var;

  const names = new Set(rows.map((row) => row.player));
  const rawPlayers = await db
    .select()
    .from(players)
    .where(inArray(players.name, [...names]));
  const idsByName = new Map(
    rawPlayers.map((player) => [player.name, player.id]),
  );
  const values = [...names].flatMap((name) => {
    if (idsByName.has(name)) {
      return [];
    }

    const id = crypto.randomUUID();
    idsByName.set(name, id);

    return [{ id, name }];
  });
  const inserts = values.length > 0 ? [db.insert(players).values(values)] : [];

  return { idsByName, inserts };
}

async function prepareArchetypes(rows: Array<EventReportRow>) {
  const { db } = getContext<HonoEnv>().var;

  const names = new Set(rows.map((row) => row.archetype));
  const rawArchetypes = await db
    .select()
    .from(archetypes)
    .where(inArray(archetypes.name, [...names]));
  const idsByName = new Map(
    rawArchetypes.map((archetype) => [archetype.name, archetype.id]),
  );
  const values = [...names].flatMap((name) => {
    if (idsByName.has(name)) {
      return [];
    }

    const id = crypto.randomUUID();
    idsByName.set(name, id);

    return [{ id, name }];
  });
  const inserts =
    values.length > 0 ? [db.insert(archetypes).values(values)] : [];

  return { idsByName, inserts };
}

function prepareRanks(
  rows: Array<EventReportRow>,
  eventId: string,
  playerIdsByName: Map<string, string>,
  archetypeIdsByName: Map<string, string>,
) {
  const { db } = getContext<HonoEnv>().var;

  const values = rows.map((row) => {
    const playerId = playerIdsByName.get(row.player);
    const archetypeId = archetypeIdsByName.get(row.archetype);

    if (!playerId || !archetypeId) {
      throw new Error("Could not resolve report player or archetype");
    }

    return {
      eventId,
      playerId,
      archetypeId,
      position: row.rank,
      wins: row.wins,
      losses: row.losses,
      draws: row.draws,
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
