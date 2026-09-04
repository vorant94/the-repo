import type { PieArcDatum } from "d3-shape";
import { arc, pie } from "d3-shape";
import { css, cx } from "hono/css";
import type { EventReport } from "../queries/find-event-report.ts";

const chartWidth = 896;
const chartHeight = 760;
const pieOuterRadius = 240;
const labelHorizontalLineLength = 129;
const minimumPlayersForPercentages = 64;
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
  mode: "dark" | "light";
  report: EventReport;
}

export const EventReportChart = ({ mode, report }: EventReportChartProps) => {
  const isDark = mode === "dark";
  const totalPlayers = report.ranks.length;
  const distribution = getArchetypeDistribution(report.ranks);
  const labels = getPieLabels(distribution, totalPlayers);
  const slices = pie<ArchetypeDistribution>()
    .sort(null)
    .value((item) => item.count)
    .startAngle(0)
    .endAngle(-2 * Math.PI)
    .padAngle((2 * Math.PI) / 360)(distribution);
  const slicePath = arc<PieArcDatum<ArchetypeDistribution>>()
    .innerRadius(140)
    .outerRadius(pieOuterRadius);

  return (
    <section class={chartSectionStyle}>
      <svg
        aria-label="Archetype distribution"
        class={chartStyle}
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        <g transform={`translate(${chartWidth / 2} ${chartHeight / 2})`}>
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
          <g key={label.name}>
            <path
              d={`M ${label.connectorX} ${label.connectorY} L ${label.elbowX} ${label.y} L ${label.textX} ${label.y}`}
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
            <text
              fill={isDark ? "#f8fafc" : "#0f172a"}
              font-size="18"
              font-weight="700"
              text-anchor={label.textAnchor}
              x={label.textX}
              y={label.y - 6}
            >
              {label.name}
            </text>
            <text
              fill={isDark ? "#94a3b8" : "#64748b"}
              font-size="15"
              font-weight="600"
              text-anchor={label.textAnchor}
              x={label.textX}
              y={label.y + 17}
            >
              {label.value}
            </text>
          </g>
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
  elbowX: number;
  name: string;
  textAnchor: "end" | "start";
  textX: number;
  value: string;
  y: number;
}

function getArchetypeDistribution(
  standings: EventReport["ranks"],
): Array<ArchetypeDistribution> {
  const counts = new Map<string, number>();
  for (const standing of standings) {
    const name = standing.archetype.name;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (left, right) =>
      right.count - left.count || left.name.localeCompare(right.name),
  );
}

function getPieLabels(
  distribution: Array<ArchetypeDistribution>,
  totalPlayers: number,
): Array<PieLabel> {
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;
  let angle = 0;
  const labels = distribution.map((item) => {
    const endAngle = angle - (item.count / totalPlayers) * 2 * Math.PI;
    const midAngle = (angle + endAngle) / 2;
    const isRightSide = Math.sin(midAngle) >= 0;
    const connectorX = centerX + Math.sin(midAngle) * (pieOuterRadius + 10);
    const connectorY = centerY - Math.cos(midAngle) * (pieOuterRadius + 10);
    const textAnchor: PieLabel["textAnchor"] = isRightSide ? "end" : "start";
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
  if (totalPlayers >= minimumPlayersForPercentages) {
    return `${((count / totalPlayers) * 100).toFixed(1)}%`;
  }

  return `${count} ${count === 1 ? "PLAYER" : "PLAYERS"}`;
}
