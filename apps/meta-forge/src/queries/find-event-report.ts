import { asc, eq } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { z } from "zod";
import type { HonoEnv } from "../shared/hono-env.ts";
import { archetypes } from "../shared/schema/archetypes.ts";
import { events } from "../shared/schema/events.ts";
import { hosts } from "../shared/schema/hosts.ts";
import { players } from "../shared/schema/players.ts";
import { ranks } from "../shared/schema/ranks.ts";

export const eventReportDtoSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    hostedAt: z.iso.datetime({ offset: true }),
    host: z.object({ name: z.string(), address: z.string() }),
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
export type EventReport = z.infer<typeof eventReportDtoSchema>;

export async function findEventReport(eventId: string) {
  const { db } = getContext<HonoEnv>().var;
  const rawEventReportRows = await db
    .select({
      event: { id: events.id, name: events.name, hostedAt: events.hostedAt },
      host: { name: hosts.name, address: hosts.address },
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

  return eventReportDtoSchema.parse({
    ...rawEventReport.event,
    host: rawEventReport.host,
    ranks: reportRanks,
  });
}
