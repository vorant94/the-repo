import { cn } from "cn";
import type { FC } from "react";
import { Pie, PieChart } from "recharts";
import { z } from "zod";
import type { PieLabelProps } from "./pie-label.tsx";
import { PieLabel } from "./pie-label.tsx";
import { PieSlice } from "./pie-slice.tsx";
import { useEventReportData } from "./use-event-report-data.ts";

const chartWidth = 896;
const chartHeight = 760;
const pieOuterRadius = 240;
const pieStartAngle = 90;
const pieEndAngle = -360;
const labelHorizontalLineLength = 129;
const maxRowsPerTable = 18;
const minimumPlayersForPercentages = 64;
const pieSweepAngle =
  Math.sign(pieEndAngle - pieStartAngle) *
  Math.min(Math.abs(pieEndAngle - pieStartAngle), 360);

export const eventReportPropsSchema = z.object({
  eventId: z.string(),
  mode: z.enum(["light", "dark"]),
});

export type EventReportProps = z.infer<typeof eventReportPropsSchema>;

export const EventReport: FC<EventReportProps> = ({ eventId, mode }) => {
  const data = useEventReportData();

  if (!data) {
    return null;
  }

  const event = data.events.find((candidate) => candidate.id === eventId);

  if (!event) {
    throw new Error(`Unknown meta report event: ${eventId}`);
  }

  const players = new Map(data.players.map((player) => [player.id, player]));
  const archetypes = new Map(
    data.archetypes.map((archetype) => [archetype.id, archetype]),
  );
  const host = data.hosts.find((host) => host.id === event.hostId);

  if (!host) {
    throw new Error(`Unknown host: ${event.hostId}`);
  }

  const standings = event.standings.map((standing) => {
    const player = players.get(standing.playerId);
    const archetype = archetypes.get(standing.archetypeId);

    if (!player || !archetype) {
      throw new Error(`Invalid standing in event: ${event.id}`);
    }

    return { ...standing, archetype, player };
  });

  const totalPlayers = standings.length;
  const distribution = getArchetypeDistribution(standings);
  const pieLabelLayouts = getPieLabelLayouts(distribution, totalPlayers);
  const firstTableLength = Math.ceil(totalPlayers / 2);
  const standingsTables =
    totalPlayers > maxRowsPerTable
      ? [
          standings.slice(0, firstTableLength),
          standings.slice(firstTableLength),
        ]
      : [standings];
  const isDark = mode === "dark";

  return (
    <div
      className={cn(
        "h-full w-full p-16 font-sans",
        isDark ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-950",
      )}
    >
      <header
        className={cn(
          "flex items-end justify-between border-b-4 pb-6",
          isDark ? "border-slate-50" : "border-slate-950",
        )}
      >
        <div>
          <p
            className={cn(
              "font-bold text-2xl uppercase tracking-[0.2em]",
              isDark ? "text-orange-400" : "text-orange-600",
            )}
          >
            Pauper meta report
          </p>
          <h1 className="mt-2 font-black text-6xl leading-none tracking-tight">
            {event.name}
          </h1>
        </div>
        <div
          className={cn(
            "text-right font-semibold text-xl",
            isDark ? "text-slate-400" : "text-slate-600",
          )}
        >
          <p>{host.name}</p>
          <p>{event.date}</p>
        </div>
      </header>

      <main className="mt-8 flex">
        <div className="relative h-190 w-1/2">
          <PieChart
            width={chartWidth}
            height={chartHeight}
            accessibilityLayer
          >
            <Pie
              data={distribution}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              startAngle={pieStartAngle}
              endAngle={pieEndAngle}
              innerRadius={140}
              outerRadius={pieOuterRadius}
              paddingAngle={2}
              isAnimationActive={false}
              shape={PieSlice}
              labelLine={false}
              label={({ index }) => {
                const pieLabel = pieLabelLayouts[index];

                if (!pieLabel) {
                  return null;
                }

                return (
                  <PieLabel
                    {...pieLabel}
                    isDark={isDark}
                  />
                );
              }}
              stroke={isDark ? "#020617" : "#f8fafc"}
              strokeWidth={5}
            />
          </PieChart>
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-bold text-2xl leading-relaxed tracking-[0.15em]",
              isDark ? "text-slate-200" : "text-slate-700",
            )}
          >
            <p>{totalPlayers} PLAYERS</p>
            <p>{distribution.length} ARCHETYPES</p>
          </div>
        </div>

        <section className="h-190 w-1/2 pl-8">
          <h2 className="font-black text-3xl tracking-tight">
            Final standings
          </h2>
          <div
            className={cn(
              "mt-5 grid gap-4",
              standingsTables.length === 1 ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            {standingsTables.map((standings, tableIndex) => (
              <table
                key={standings.at(0)?.player.name ?? "empty-standings"}
                className="w-full table-fixed border-collapse text-left text-xs"
              >
                <thead
                  className={cn(
                    "border-y text-[10px] uppercase tracking-widest",
                    isDark
                      ? "border-slate-700 text-slate-400"
                      : "border-slate-300 text-slate-500",
                  )}
                >
                  <tr>
                    <th className="w-8 py-2 font-bold">#</th>
                    <th className="py-2 font-bold">Player</th>
                    <th className="w-36 py-2 font-bold">Deck</th>
                    <th className="w-12 py-2 text-center font-bold">W/L/D</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((standing, index) => (
                    <tr
                      key={`${standing.player.name}-${standing.archetype.name}`}
                      className={cn(
                        "border-b",
                        isDark ? "border-slate-800" : "border-slate-200",
                      )}
                    >
                      <td className="py-2 font-bold tabular-nums">
                        {tableIndex * firstTableLength + index + 1}
                      </td>
                      <td className="py-2 font-semibold">
                        {standing.player.name}
                      </td>
                      <td
                        className={cn(
                          "py-2 font-semibold",
                          isDark ? "text-slate-300" : "text-slate-600",
                        )}
                      >
                        {standing.archetype.name}
                      </td>
                      <td className="py-2 text-center font-semibold tabular-nums">
                        {formatRecord(
                          standing.result.wins,
                          standing.result.loses,
                          standing.result.draws,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

interface ArchetypeDistribution {
  name: string;
  count: number;
}

const getArchetypeDistribution = (
  standings: Array<{ archetype: { name: string } }>,
): Array<ArchetypeDistribution> => {
  const counts = new Map<string, number>();

  for (const standing of standings) {
    const name = standing.archetype.name;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (left, right) =>
      right.count - left.count || left.name.localeCompare(right.name),
  );
};

const getPieLabelLayouts = (
  distribution: Array<ArchetypeDistribution>,
  totalPlayers: number,
): Array<Omit<PieLabelProps, "isDark">> => {
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;
  let angle = pieStartAngle;
  const labels = distribution.map((item) => {
    const endAngle = angle + (item.count / totalPlayers) * pieSweepAngle;
    const midAngle = (angle + endAngle) / 2;
    const radians = (-midAngle * Math.PI) / 180;
    const isRightSide = Math.cos(radians) >= 0;
    const connectorX = centerX + Math.cos(radians) * (pieOuterRadius + 10);
    const connectorY = centerY + Math.sin(radians) * (pieOuterRadius + 10);
    const textAnchor: PieLabelProps["textAnchor"] = isRightSide
      ? "end"
      : "start";
    const textX = isRightSide ? chartWidth - 24 : 24;
    const elbowX = isRightSide
      ? textX - labelHorizontalLineLength
      : textX + labelHorizontalLineLength;
    angle = endAngle;

    return {
      connectorX,
      connectorY,
      elbowX,
      isRightSide,
      name: item.name,
      value: formatArchetypeValue(item.count, totalPlayers),
      textAnchor,
      textX,
      y: 0,
    };
  });

  const positionedLabels = new Map<string, Omit<PieLabelProps, "isDark">>();
  for (const isRightSide of [false, true]) {
    const sideLabels = labels
      .filter((label) => label.isRightSide === isRightSide)
      .toSorted((left, right) => left.connectorY - right.connectorY);
    const gap = 650 / (sideLabels.length + 1);

    sideLabels.forEach((label, index) => {
      positionedLabels.set(label.name, {
        ...label,
        y: 55 + gap * (index + 1),
      });
    });
  }

  return labels.map((label) => positionedLabels.get(label.name) ?? label);
};

const formatRecord = (wins: number, loses: number, draws?: number): string =>
  `${wins}/${loses}/${draws ?? 0}`;

const formatArchetypeValue = (count: number, totalPlayers: number): string => {
  if (totalPlayers >= minimumPlayersForPercentages) {
    return `${((count / totalPlayers) * 100).toFixed(1)}%`;
  }

  return `${count} ${count === 1 ? "PLAYER" : "PLAYERS"}`;
};
