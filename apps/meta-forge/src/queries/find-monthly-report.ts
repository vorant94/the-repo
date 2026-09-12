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

  const valuesByCity = new Map<MonthlyReportCityName, CityValues>();
  const valuesByHost = new Map<string, HostValues>();
  for (const row of rows) {
    const city = findMonthlyReportCity(row.address);
    const hostValues = valuesByHost.get(row.hostId) ?? {
      city,
      eventIds: new Set<string>(),
      name: row.hostName,
    };
    hostValues.eventIds.add(row.eventId);
    valuesByHost.set(row.hostId, hostValues);

    if (!city) {
      continue;
    }

    const cityValues = valuesByCity.get(city) ?? {
      archetypeIds: new Set<string>(),
      eventPlayerIds: new Map<string, Set<string>>(),
      hostIds: new Set<string>(),
      playerIds: new Set<string>(),
    };
    cityValues.hostIds.add(row.hostId);
    const eventPlayerIds =
      cityValues.eventPlayerIds.get(row.eventId) ?? new Set();
    if (row.playerId) {
      eventPlayerIds.add(row.playerId);
      cityValues.playerIds.add(row.playerId);
    }
    cityValues.eventPlayerIds.set(row.eventId, eventPlayerIds);
    if (row.archetypeId) {
      cityValues.archetypeIds.add(row.archetypeId);
    }
    valuesByCity.set(city, cityValues);
  }

  const cities = [...valuesByCity]
    .map(([name, values]) => {
      let largeEventCount = 0;
      let mediumEventCount = 0;
      let smallEventCount = 0;
      for (const playerIds of values.eventPlayerIds.values()) {
        if (playerIds.size < 8) {
          smallEventCount += 1;
        } else if (playerIds.size < 16) {
          mediumEventCount += 1;
        } else {
          largeEventCount += 1;
        }
      }

      return {
        archetypeCount: values.archetypeIds.size,
        eventCount: values.eventPlayerIds.size,
        hostCount: values.hostIds.size,
        largeEventCount,
        mediumEventCount,
        name,
        playerCount: values.playerIds.size,
        smallEventCount,
      };
    })
    .toSorted(
      (left, right) =>
        monthlyReportCityNames.indexOf(left.name) -
        monthlyReportCityNames.indexOf(right.name),
    );
  const monthlyHosts = [...valuesByHost.values()]
    .map((host) => ({
      city: host.city,
      eventCount: host.eventIds.size,
      name: host.name,
    }))
    .toSorted((left, right) => left.name.localeCompare(right.name));

  return monthlyReportPayloadSchema.parse({
    cities,
    hosts: monthlyHosts,
    month,
  });
}

interface CityValues {
  archetypeIds: Set<string>;
  eventPlayerIds: Map<string, Set<string>>;
  hostIds: Set<string>;
  playerIds: Set<string>;
}

interface HostValues {
  city: MonthlyReportCityName | null;
  eventIds: Set<string>;
  name: string;
}
