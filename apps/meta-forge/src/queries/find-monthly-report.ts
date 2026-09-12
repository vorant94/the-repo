import { eq, sql } from "drizzle-orm";
import { getAppContext } from "../shared/app-context.ts";
import {
  findMonthlyReportCity,
  type MonthlyReportCityName,
  monthlyReportCityNames,
} from "../shared/monthly-report-city.ts";
import { events } from "../shared/schema/events.ts";
import { hosts } from "../shared/schema/hosts.ts";
import { monthlyReportPayloadSchema } from "../shared/schema/jobs.ts";
import { ranks } from "../shared/schema/ranks.ts";

export async function findMonthlyReport(month: string) {
  const { db } = getAppContext();
  const targetMonth = month.slice(0, 7);
  const rows = await db
    .select({
      address: hosts.address,
      archetypeId: ranks.archetypeId,
      eventId: events.id,
      hostId: hosts.id,
      hostName: hosts.name,
      playerId: ranks.playerId,
    })
    .from(events)
    .innerJoin(hosts, eq(events.hostedBy, hosts.id))
    .leftJoin(ranks, eq(ranks.eventId, events.id))
    .where(sql`substr(${events.hostedAt}, 1, 7) = ${targetMonth}`);

  const valuesByEvent = new Map<string, EventValues>();
  for (const row of rows) {
    const eventValues = valuesByEvent.get(row.eventId) ?? {
      archetypeIds: new Set<string>(),
      city: findMonthlyReportCity(row.address),
      hostId: row.hostId,
      hostName: row.hostName,
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
  const valuesByHost = new Map<string, HostValues>();
  for (const event of valuesByEvent.values()) {
    if (event.playerIds.size < minimumPlayerCount) {
      continue;
    }

    const hostValues = valuesByHost.get(event.hostId) ?? {
      city: event.city,
      eventCount: 0,
      name: event.hostName,
    };
    hostValues.eventCount += 1;
    valuesByHost.set(event.hostId, hostValues);

    if (!event.city) {
      continue;
    }

    const cityValues = valuesByCity.get(event.city) ?? {
      archetypeIds: new Set<string>(),
      eventCount: 0,
      hostIds: new Set<string>(),
      largeEventCount: 0,
      mediumEventCount: 0,
      playerIds: new Set<string>(),
      smallEventCount: 0,
    };
    cityValues.eventCount += 1;
    cityValues.hostIds.add(event.hostId);
    for (const playerId of event.playerIds) {
      cityValues.playerIds.add(playerId);
    }
    for (const archetypeId of event.archetypeIds) {
      cityValues.archetypeIds.add(archetypeId);
    }
    if (event.playerIds.size < 8) {
      cityValues.smallEventCount += 1;
    } else if (event.playerIds.size < 16) {
      cityValues.mediumEventCount += 1;
    } else {
      cityValues.largeEventCount += 1;
    }
    valuesByCity.set(event.city, cityValues);
  }

  const cities = [...valuesByCity]
    .map(([name, values]) => ({
      archetypeCount: values.archetypeIds.size,
      eventCount: values.eventCount,
      hostCount: values.hostIds.size,
      largeEventCount: values.largeEventCount,
      mediumEventCount: values.mediumEventCount,
      name,
      playerCount: values.playerIds.size,
      smallEventCount: values.smallEventCount,
    }))
    .toSorted(
      (left, right) =>
        monthlyReportCityNames.indexOf(left.name) -
        monthlyReportCityNames.indexOf(right.name),
    );
  const monthlyHosts = [...valuesByHost.values()].toSorted((left, right) =>
    left.name.localeCompare(right.name),
  );

  return monthlyReportPayloadSchema.parse({
    cities,
    hosts: monthlyHosts,
    month,
  });
}

interface CityValues {
  archetypeIds: Set<string>;
  eventCount: number;
  hostIds: Set<string>;
  largeEventCount: number;
  mediumEventCount: number;
  playerIds: Set<string>;
  smallEventCount: number;
}

interface EventValues {
  archetypeIds: Set<string>;
  city: MonthlyReportCityName | null;
  hostId: string;
  hostName: string;
  playerIds: Set<string>;
}

interface HostValues {
  city: MonthlyReportCityName | null;
  eventCount: number;
  name: string;
}

const minimumPlayerCount = 6;
