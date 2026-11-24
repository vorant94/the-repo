import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { renderToString } from "hono/jsx/dom/server";
import { jsx } from "hono/jsx/jsx-runtime";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { EventReportPreview } from "../../../components/event-report-preview.tsx";
import { findArchetypesByNames } from "../../../queries/find-archetypes-by-names.ts";
import { findEventReport } from "../../../queries/find-event-report.ts";
import { findPlayersByNames } from "../../../queries/find-players-by-names.ts";
import { getAppContext } from "../../../shared/app-context.ts";
import { getEventReportPages } from "../../../shared/event-report-pages.ts";
import type { HonoEnv } from "../../../shared/hono-env.ts";
import { getUser } from "../../../shared/permissions.ts";
import { archetypes } from "../../../shared/schema/archetypes.ts";
import { events } from "../../../shared/schema/events.ts";
import {
  type EventReportPayload,
  eventReportJobSchema,
  eventReportPayloadSchema,
  jobStatuses,
  jobs,
  jobTypes,
} from "../../../shared/schema/jobs.ts";
import { players } from "../../../shared/schema/players.ts";
import { ranks } from "../../../shared/schema/ranks.ts";

export const eventReportRoute = new Hono<HonoEnv>();

const eventReportCreateSchema = eventReportPayloadSchema.omit({ id: true });
const eventParamSchema = z.object({ eventId: z.uuid() });
const eventReportPreviewQuerySchema = z.object({
  mode: z.enum(["dark", "light"]).default("dark"),
  page: z.coerce.number().int().positive().default(1),
});
type EventReportRank = EventReportPayload["ranks"][number];
// Keep multi-row inserts below D1's bound-parameter limit.
const maximumRowsPerStatement = 5;

eventReportRoute.use("*", async (c, next) => {
  const { eventId } = eventParamSchema.parse(c.req.param());
  const eventReport = await findEventReport(eventId);
  if (!eventReport) {
    throw new HTTPException(404, { message: "Event report was not found" });
  }

  const appContext = getAppContext();
  appContext.eventReport = eventReport;
  await next();
});

eventReportRoute.get(
  "/",
  describeRoute({
    description:
      "Get an event report with its venue and standings. Requires ownership of this venue or system admin access.",
    tags: ["event reports"],
    responses: {
      403: { description: "Insufficient permission" },
      200: {
        description: "Event report",
        content: {
          "application/json": { schema: resolver(eventReportPayloadSchema) },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Event report not found" },
    },
  }),
  (c) => {
    const { eventReport } = getAppContext();
    if (!eventReport) {
      throw new HTTPException(404, { message: "Event report was not found" });
    }

    return c.json(eventReport);
  },
);

eventReportRoute.post(
  "/",
  describeRoute({
    description:
      "Import report data into an existing event. Requires ownership of this venue or system admin access.",
    tags: ["event reports"],
    responses: {
      403: { description: "Insufficient permission" },
      201: {
        description: "Created event report",
        content: {
          "application/json": { schema: resolver(eventReportPayloadSchema) },
        },
      },
      400: { description: "Invalid event report or venue" },
      401: { description: "Unauthorized" },
      404: { description: "Event not found" },
      409: { description: "Event already has ranks" },
    },
  }),
  validator("json", eventReportCreateSchema),
  async (c) => {
    const { db, eventReport } = getAppContext();
    if (!eventReport) {
      throw new HTTPException(404, { message: "Event was not found" });
    }
    const userId = getUser().id;
    const { eventId } = eventParamSchema.parse(c.req.param());
    const {
      name,
      venue,
      hostedAt,
      isLeagueBranded,
      ranks: reportRanks,
    } = c.req.valid("json");
    if (venue.name !== eventReport.venue.name) {
      throw new HTTPException(400, { message: "Venue does not match event" });
    }
    if (eventReport.ranks.length > 0) {
      throw new HTTPException(409, { message: "Event already has ranks" });
    }

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
      db
        .update(events)
        .set({ name, hostedAt, isLeagueBranded, updatedBy: userId })
        .where(eq(events.id, eventId)),
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

eventReportRoute.post(
  "/generate",
  describeRoute({
    description:
      "Queue an event report screenshot generation. Requires ownership of this venue or system admin access.",
    tags: ["event reports"],
    responses: {
      403: { description: "Insufficient permission" },
      202: {
        description: "Queued event report generation",
        content: {
          "application/json": { schema: resolver(eventReportJobSchema) },
        },
      },
      401: { description: "Unauthorized" },
      404: { description: "Event report was not found" },
    },
  }),
  async (c) => {
    const { db, eventReport, queue } = getAppContext();
    if (!eventReport) {
      throw new HTTPException(404, { message: "Event report was not found" });
    }
    const userId = getUser().id;

    const jobsRows = await db
      .insert(jobs)
      .values({
        id: crypto.randomUUID(),
        type: jobTypes.eventReport,
        status: jobStatuses.queued,
        payload: eventReport,
        result: null,
        error: null,
        requestedBy: userId,
        eventId: eventReport.id,
      })
      .returning();
    const job = jobsRows.at(0);
    if (!job) {
      throw new Error("Job insertion returned no record");
    }

    await queue.send({ jobId: job.id });

    return c.json(eventReportJobSchema.parse(job), 202);
  },
);

if (import.meta.env.DEV) {
  eventReportRoute.get(
    "/preview",
    describeRoute({
      description:
        "Preview an event report. Requires ownership of this venue or system admin access.",
      tags: ["event reports"],
      responses: {
        403: { description: "Insufficient permission" },
        200: {
          description: "Event report preview",
          content: { "text/html": { schema: { type: "string" } } },
        },
        404: { description: "Event report not found" },
      },
    }),
    validator("query", eventReportPreviewQuerySchema),
    (c) => {
      const { mode, page } = c.req.valid("query");
      const { eventReport } = getAppContext();
      if (!eventReport) {
        throw new HTTPException(404, { message: "Event report was not found" });
      }
      const reportPage = getEventReportPages(eventReport.ranks.length).at(
        page - 1,
      );
      if (!reportPage) {
        throw new HTTPException(404, { message: "Report page was not found" });
      }

      const html = renderToString(
        jsx(EventReportPreview, {
          mode,
          page: reportPage,
          report: eventReport,
        }),
      );
      return c.html(html);
    },
  );
}

async function preparePlayers(reportRanks: Array<EventReportRank>) {
  const { db } = getAppContext();
  const userId = getUser().id;
  const names = new Set(reportRanks.map((rank) => rank.player.name));
  const idsByName = await findPlayersByNames([...names]);
  const values = [...names].flatMap((name) => {
    if (idsByName.has(name)) {
      return [];
    }

    const id = crypto.randomUUID();
    idsByName.set(name, id);
    return [{ id, name, createdBy: userId, updatedBy: userId }];
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
  const userId = getUser().id;
  const names = new Set(reportRanks.map((rank) => rank.archetype.name));
  const idsByName = await findArchetypesByNames([...names]);
  const values = [...names].flatMap((name) => {
    if (idsByName.has(name)) {
      return [];
    }

    const id = crypto.randomUUID();
    idsByName.set(name, id);
    return [{ id, name, createdBy: userId, updatedBy: userId }];
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
  const userId = getUser().id;
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
      createdBy: userId,
      updatedBy: userId,
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
