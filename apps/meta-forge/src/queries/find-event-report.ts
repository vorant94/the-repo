import { asc, eq } from "drizzle-orm";
import { getAppContext } from "../shared/app-context.ts";
import { archetypes } from "../shared/schema/archetypes.ts";
import { events } from "../shared/schema/events.ts";
import { eventReportPayloadSchema } from "../shared/schema/jobs.ts";
import { players } from "../shared/schema/players.ts";
import { ranks } from "../shared/schema/ranks.ts";
import { venues } from "../shared/schema/venues.ts";

export async function findEventReport(eventId: string) {
  const { db } = getAppContext();
  const rawEventReportRows = await db
    .select({
      event: { id: events.id, name: events.name, hostedAt: events.hostedAt },
      venue: { name: venues.name, address: venues.address },
      rank: {
        position: ranks.position,
        wins: ranks.wins,
        losses: ranks.losses,
        draws: ranks.draws,
        isArchetypeHidden: ranks.isArchetypeHidden,
      },
      player: { name: players.name },
      archetype: { name: archetypes.name },
    })
    .from(events)
    .innerJoin(venues, eq(events.hostedBy, venues.id))
    .leftJoin(ranks, eq(ranks.eventId, events.id))
    .leftJoin(players, eq(ranks.playerId, players.id))
    .leftJoin(archetypes, eq(ranks.archetypeId, archetypes.id))
    .where(eq(events.id, eventId))
    .orderBy(asc(ranks.position));
  const rawEventReport = rawEventReportRows.at(0);
  if (!rawEventReport) {
    return null;
  }

  const reportRanks = rawEventReportRows.flatMap((rawRow) => {
    const { rank, player, archetype } = rawRow;
    if (!rank || !player || !archetype) {
      return [];
    }

    return [{ ...rank, player, archetype }];
  });

  return eventReportPayloadSchema.parse({
    ...rawEventReport.event,
    venue: rawEventReport.venue,
    ranks: reportRanks,
  });
}
