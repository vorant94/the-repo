import type { PieArcDatum } from "d3-shape";
import { arc, pie } from "d3-shape";
import { css, cx } from "hono/css";
import { minimumPlayersForMultiPageReport } from "../shared/event-report-pages.ts";
import type { EventReportPayload } from "../shared/schema/jobs.ts";

const chartWidth = 896;
const fullPageChartWidth = 1792;
const chartHeight = 760;
const pieOuterRadius = 240;
const fullPagePieOuterRadius = 300;
const labelRailOffset = 45;
const maximumArchetypeLabelLength = 24;
const pieColors = [
  "#2563eb",
  "#dc2626",
  "#f59e0b",
  "#16a34a",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#db2777",
  "#65a30d",
  "#4f46e5",
  "#0f766e",
  "#a16207",
  "#9333ea",
  "#be123c",
  "#15803d",
  "#475569",
];

interface EventReportChartProps {
  fullPage?: boolean;
  mode: "dark" | "light";
  report: EventReportPayload;
}

export const EventReportChart = ({
  fullPage,
  mode,
  report,
}: EventReportChartProps) => {
  const isDark = mode === "dark";
  const totalPlayers = report.ranks.length;
  const width = fullPage ? fullPageChartWidth : chartWidth;
  const outerRadius = fullPage ? fullPagePieOuterRadius : pieOuterRadius;
  const distribution = getArchetypeDistribution(report.ranks);
  const chartDistribution =
    totalPlayers >= minimumPlayersForMultiPageReport
      ? groupSinglePlayerArchetypes(distribution)
      : distribution;
  const firstSliceAngle =
    ((chartDistribution[0]?.count ?? 0) / totalPlayers) * 2 * Math.PI;
  const startAngle =
    totalPlayers >= minimumPlayersForMultiPageReport ? firstSliceAngle / 3 : 0;
  const labels = getPieLabels(
    chartDistribution,
    totalPlayers,
    width,
    outerRadius,
    startAngle,
  );
  const slices = pie<ArchetypeDistribution>()
    .sort(null)
    .value((item) => item.count)
    .startAngle(startAngle)
    .endAngle(startAngle - 2 * Math.PI)
    .padAngle((2 * Math.PI) / 360)(chartDistribution);
  const slicePath = arc<PieArcDatum<ArchetypeDistribution>>()
    .innerRadius(140)
    .outerRadius(outerRadius);

  return (
    <section
      class={cx(chartSectionStyle, fullPage && fullPageChartSectionStyle)}
    >
      <svg
        aria-label="Archetype distribution"
        class={chartStyle}
        role="img"
        viewBox={`0 0 ${width} ${chartHeight}`}
      >
        <g transform={`translate(${width / 2} ${chartHeight / 2})`}>
          {slices.map((slice, index) => (
            <path
              key={slice.data.name}
              d={slicePath(slice) ?? ""}
              fill={pieColors[index % pieColors.length] ?? "#475569"}
              stroke={isDark ? "#020617" : "#f8fafc"}
              stroke-width="5"
            />
          ))}
        </g>
        {labels.map((label) => (
          <g key={`${label.name}-connector`}>
            <path
              d={`M ${label.connectorX} ${label.connectorY} C ${label.railX} ${label.connectorY} ${(label.connectorX + label.railX) / 2} ${label.y} ${label.railX} ${label.y}`}
              fill="none"
              stroke={isDark ? "#94a3b8" : "#64748b"}
              stroke-width="2"
            />
            <circle
              cx={label.connectorX}
              cy={label.connectorY}
              fill={isDark ? "#cbd5e1" : "#475569"}
              r="4"
            />
          </g>
        ))}
        {labels.map((label) => (
          <g key={label.name}>
            <text
              fill={isDark ? "#f8fafc" : "#0f172a"}
              font-size="18"
              font-weight="700"
              paint-order="stroke"
              stroke={isDark ? "#020617" : "#f8fafc"}
              stroke-width="8"
              text-anchor={label.textAnchor}
              x={label.textX}
              y={label.y - 6}
            >
              <title>{label.name}</title>
              {truncateArchetypeLabel(label.name)}
            </text>
            <text
              fill={isDark ? "#94a3b8" : "#64748b"}
              font-size="15"
              font-weight="600"
              paint-order="stroke"
              stroke={isDark ? "#020617" : "#f8fafc"}
              stroke-width="8"
              text-anchor={label.textAnchor}
              x={label.textX}
              y={label.y + 17}
            >
              {label.value}
            </text>
          </g>
        ))}
        {labels.map((label) => (
          <line
            key={`${label.name}-underline`}
            x1={label.railX}
            x2={label.textX}
            y1={label.y}
            y2={label.y}
            stroke={isDark ? "#94a3b8" : "#64748b"}
            stroke-width="2"
          />
        ))}
      </svg>
      <div class={cx(chartCenterStyle, isDark && darkChartCenterStyle)}>
        <p>{`${totalPlayers} PLAYERS`}</p>
        <p>{`${distribution.length} ARCHETYPES`}</p>
      </div>
    </section>
  );
};

interface ArchetypeDistribution {
  count: number;
  name: string;
}

const chartSectionStyle = css`
  position: relative;
  width: 50%;
  height: 760px;
`;
const fullPageChartSectionStyle = css`
  width: 100%;
`;
const chartStyle = css`
  display: block;
  width: 100%;
  height: 100%;
`;
const chartCenterStyle = css`
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  color: #334155;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.15em;
  line-height: 1.625;
  text-align: center;
  white-space: nowrap;
`;
const darkChartCenterStyle = css`
  color: #e2e8f0;
`;

interface PieLabel {
  connectorX: number;
  connectorY: number;
  name: string;
  railX: number;
  textAnchor: "end" | "start";
  textX: number;
  value: string;
  y: number;
}

function getArchetypeDistribution(
  ranks: EventReportPayload["ranks"],
): Array<ArchetypeDistribution> {
  const counts = new Map<string, number>();
  for (const rank of ranks) {
    const name = rank.isArchetypeHidden ? "Homebrew" : rank.archetype.name;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (left, right) =>
      right.count - left.count || left.name.localeCompare(right.name),
  );
}

function groupSinglePlayerArchetypes(
  distribution: Array<ArchetypeDistribution>,
): Array<ArchetypeDistribution> {
  const singlePlayerCount = distribution.filter(
    (item) => item.count === 1,
  ).length;
  if (singlePlayerCount === 0) {
    return distribution;
  }

  const otherCount =
    distribution.find((item) => item.name === "Other" && item.count > 1)
      ?.count ?? 0;
  return [
    ...distribution.filter((item) => item.count > 1 && item.name !== "Other"),
    { name: "Other", count: singlePlayerCount + otherCount },
  ].sort(
    (left, right) =>
      right.count - left.count || left.name.localeCompare(right.name),
  );
}

function getPieLabels(
  distribution: Array<ArchetypeDistribution>,
  totalPlayers: number,
  width: number,
  outerRadius: number,
  startAngle: number,
): Array<PieLabel> {
  const centerX = width / 2;
  const centerY = chartHeight / 2;
  const labelInset = width === fullPageChartWidth ? 300 : 24;
  let angle = startAngle;
  const labels = distribution.map((item) => {
    const endAngle = angle - (item.count / totalPlayers) * 2 * Math.PI;
    const midAngle = (angle + endAngle) / 2;
    const isRightSide = Math.sin(midAngle) >= 0;
    const connectorX = centerX + Math.sin(midAngle) * (outerRadius + 10);
    const connectorY = centerY - Math.cos(midAngle) * (outerRadius + 10);
    const textAnchor: PieLabel["textAnchor"] = isRightSide ? "end" : "start";
    const textX = isRightSide ? width - labelInset : labelInset;
    const railX =
      centerX + (isRightSide ? 1 : -1) * (outerRadius + labelRailOffset);
    angle = endAngle;

    return {
      connectorX,
      connectorY,
      isRightSide,
      name: item.name,
      railX,
      textAnchor,
      textX,
      value: formatArchetypeValue(item.count, totalPlayers),
      y: 0,
    };
  });

  const positionedLabels = new Map<string, PieLabel>();
  for (const isRightSide of [false, true]) {
    const sideLabels = labels
      .filter((label) => label.isRightSide === isRightSide)
      .toSorted((left, right) => left.connectorY - right.connectorY);
    const gap = 650 / (sideLabels.length + 1);
    sideLabels.forEach((label, index) => {
      positionedLabels.set(label.name, { ...label, y: 55 + gap * (index + 1) });
    });
  }

  return labels.map((label) => positionedLabels.get(label.name) ?? label);
}

function formatArchetypeValue(count: number, totalPlayers: number): string {
  if (totalPlayers >= minimumPlayersForMultiPageReport) {
    return `${((count / totalPlayers) * 100).toFixed(1)}%`;
  }

  return `${count} ${count === 1 ? "PLAYER" : "PLAYERS"}`;
}

function truncateArchetypeLabel(name: string): string {
  if (name.length <= maximumArchetypeLabelLength) {
    return name;
  }

  const truncatedName = name.slice(0, maximumArchetypeLabelLength - 1);
  const lastSpaceIndex = truncatedName.lastIndexOf(" ");
  if (lastSpaceIndex === -1) {
    return `${truncatedName}…`;
  }

  return `${truncatedName.slice(0, lastSpaceIndex)}…`;
}
