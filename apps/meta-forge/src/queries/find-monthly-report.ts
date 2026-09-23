import { eq, sql } from "drizzle-orm";
import { getAppContext } from "../shared/app-context.ts";
import {
  findMonthlyReportCity,
  type MonthlyReportCityName,
  monthlyReportCityNames,
} from "../shared/monthly-report-city.ts";
import { events } from "../shared/schema/events.ts";
import { monthlyReportPayloadSchema } from "../shared/schema/jobs.ts";
import { ranks } from "../shared/schema/ranks.ts";
import { venues } from "../shared/schema/venues.ts";

export async function findMonthlyReport(month: string) {
  const { db } = getAppContext();
  const targetMonth = month.slice(0, 7);
  const rows = await db
    .select({
      address: venues.address,
      archetypeId: ranks.archetypeId,
      eventId: events.id,
      venueId: venues.id,
      venueName: venues.name,
      playerId: ranks.playerId,
    })
    .from(events)
    .innerJoin(venues, eq(events.hostedBy, venues.id))
    .leftJoin(ranks, eq(ranks.eventId, events.id))
    .where(sql`substr(${events.hostedAt}, 1, 7) = ${targetMonth}`);

  const valuesByEvent = new Map<string, EventValues>();
  for (const row of rows) {
    const eventValues = valuesByEvent.get(row.eventId) ?? {
      archetypeIds: new Set<string>(),
      city: findMonthlyReportCity(row.address.city),
      venueId: row.venueId,
      venueName: row.venueName,
      playerIds: new Set<string>(),
    };
    if (row.playerId) {
      eventValues.playerIds.add(row.playerId);
    }
    if (row.archetypeId) {
      eventValues.archetypeIds.add(row.archetypeId);
    }
    valuesByEvent.set(row.eventId, eventValues);
  }

  const valuesByCity = new Map<MonthlyReportCityName, CityValues>();
  const valuesByVenue = new Map<string, VenueValues>();
  for (const event of valuesByEvent.values()) {
    const venueValues = valuesByVenue.get(event.venueId) ?? {
      city: event.city,
      eventCount: 0,
      name: event.venueName,
    };
    venueValues.eventCount += 1;
    valuesByVenue.set(event.venueId, venueValues);

    if (!event.city) {
      continue;
    }

    const cityValues = valuesByCity.get(event.city) ?? {
      archetypeIds: new Set<string>(),
      eventCount: 0,
      venueIds: new Set<string>(),
      playerIds: new Set<string>(),
      totalPlayerCount: 0,
    };
    cityValues.eventCount += 1;
    cityValues.totalPlayerCount += event.playerIds.size;
    cityValues.venueIds.add(event.venueId);
    for (const playerId of event.playerIds) {
      cityValues.playerIds.add(playerId);
    }
    for (const archetypeId of event.archetypeIds) {
      cityValues.archetypeIds.add(archetypeId);
    }
    valuesByCity.set(event.city, cityValues);
  }

  const cities = [...valuesByCity]
    .map(([name, values]) => ({
      archetypeCount: values.archetypeIds.size,
      averagePlayersPerEvent: values.totalPlayerCount / values.eventCount,
      eventCount: values.eventCount,
      venueCount: values.venueIds.size,
      name,
      playerCount: values.playerIds.size,
    }))
    .toSorted(
      (left, right) =>
        monthlyReportCityNames.indexOf(left.name) -
        monthlyReportCityNames.indexOf(right.name),
    );
  const monthlyVenues = [...valuesByVenue.values()].toSorted((left, right) =>
    left.name.localeCompare(right.name),
  );

  return monthlyReportPayloadSchema.parse({
    cities,
    venues: monthlyVenues,
    month,
  });
}

interface CityValues {
  archetypeIds: Set<string>;
  eventCount: number;
  venueIds: Set<string>;
  playerIds: Set<string>;
  totalPlayerCount: number;
}

interface EventValues {
  archetypeIds: Set<string>;
  city: MonthlyReportCityName | null;
  venueId: string;
  venueName: string;
  playerIds: Set<string>;
}

interface VenueValues {
  city: MonthlyReportCityName | null;
  eventCount: number;
  name: string;
}
