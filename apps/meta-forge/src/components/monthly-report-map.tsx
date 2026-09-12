import type { GeoPermissibleObjects } from "d3-geo";
import { geoMercator, geoPath } from "d3-geo";
import { css } from "hono/css";
import israelGeoJson from "../assets/israel.geo.json";
import { monthlyReportCities } from "../shared/monthly-report-city.ts";
import type { MonthlyReportHost } from "../shared/schema/jobs.ts";

interface MonthlyReportMapProps {
  hosts: Array<MonthlyReportHost>;
  mode: "dark" | "light";
}

export const MonthlyReportMap = ({ hosts, mode }: MonthlyReportMapProps) => {
  const isDark = mode === "dark";
  const activeCityNames = new Set(hosts.flatMap((host) => host.city ?? []));
  const activeCities = projectedCities.filter((city) =>
    activeCityNames.has(city.name),
  );
  const labels = getHostLabels(hosts);

  return (
    <section class={mapSectionStyle}>
      <svg
        aria-label="Map of Israel"
        class={mapStyle}
        role="img"
        viewBox="0 0 896 760"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Map of Israel</title>
        <defs>
          <filter
            height="120%"
            id="map-outline"
            width="120%"
            x="-10%"
            y="-10%"
          >
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius={mapBorderWidth / 2}
              result="expanded"
            />
            <feFlood
              flood-color={isDark ? "#f8fafc" : "#020617"}
              result="outline-color"
            />
            <feComposite
              in="outline-color"
              in2="expanded"
              operator="in"
              result="outline"
            />
            <feMerge>
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={mapPath}
          fill={isDark ? "#1e293b" : "#e2e8f0"}
          filter="url(#map-outline)"
        />
        {labels.map((label) => (
          <g key={label.hostName}>
            <path
              d={`M ${label.cityX} ${label.cityY} L ${label.elbowX} ${label.y} L ${label.textX} ${label.y}`}
              fill="none"
              stroke={isDark ? "#94a3b8" : "#64748b"}
              stroke-width="2"
            />
            <text
              fill={isDark ? "#f8fafc" : "#0f172a"}
              font-size="18"
              font-weight="700"
              text-anchor={label.textAnchor}
              x={label.textX}
              y={label.y - 6}
            >
              {label.hostName}
            </text>
            <text
              fill={isDark ? "#94a3b8" : "#64748b"}
              font-size="15"
              font-weight="600"
              text-anchor={label.textAnchor}
              x={label.textX}
              y={label.y + 17}
            >
              {formatEventCount(label.eventCount)}
            </text>
          </g>
        ))}
        <g aria-label="Cities with Pauper events">
          {activeCities.map((city) => (
            <circle
              aria-label={city.name}
              cx={city.x}
              cy={city.y}
              fill={isDark ? "#fb923c" : "#ea580c"}
              key={city.name}
              r={mapBorderWidth / 2}
            />
          ))}
        </g>
      </svg>
    </section>
  );
};

const mapWidth = 896;
const mapHeight = 760;
const mapPadding = 40;
const mapBorderWidth = 10;
const labelHorizontalLineLength = 160;
const labelMinimumY = 55;
const labelMaximumY = 705;
const labelGap = 54;
const israelGeometry = israelGeoJson as GeoPermissibleObjects;
const projection = geoMercator().fitExtent(
  [
    [mapPadding, mapPadding],
    [mapWidth - mapPadding, mapHeight - mapPadding],
  ],
  israelGeometry,
);
const mapPath = geoPath(projection)(israelGeometry) ?? "";
const projectedCities = monthlyReportCities.map(
  ({ latitude, longitude, name, side }) => {
    const point = projection([longitude, latitude]);
    if (!point) {
      throw new Error(`Could not project ${name}`);
    }

    const [x, y] = point;

    return { name, side, x, y };
  },
);

interface HostLabel {
  cityX: number;
  cityY: number;
  elbowX: number;
  eventCount: number;
  hostName: string;
  textAnchor: "end" | "start";
  textX: number;
  y: number;
}

function getHostLabels(hosts: Array<MonthlyReportHost>): Array<HostLabel> {
  const labels = hosts.flatMap((host) => {
    if (!host.city) {
      return [];
    }

    const city = projectedCities.find(({ name }) => name === host.city);
    if (!city) {
      throw new Error(`Could not find ${host.city}`);
    }

    const isLeft = city.side === "left";
    const textX = isLeft ? 24 : mapWidth - 24;

    return [
      {
        cityX: city.x,
        cityY: city.y,
        elbowX: isLeft
          ? textX + labelHorizontalLineLength
          : textX - labelHorizontalLineLength,
        eventCount: host.eventCount,
        hostName: host.name,
        textAnchor: isLeft ? ("start" as const) : ("end" as const),
        textX,
        y: city.y,
      },
    ];
  });

  return ["left", "right"].flatMap((side) =>
    positionLabels(
      labels.filter((label) =>
        side === "left"
          ? label.textAnchor === "start"
          : label.textAnchor === "end",
      ),
    ),
  );
}

function positionLabels(labels: Array<HostLabel>): Array<HostLabel> {
  const sortedLabels = labels.toSorted(
    (left, right) =>
      left.y - right.y || left.hostName.localeCompare(right.hostName),
  );
  let nextY = labelMinimumY;
  const positionedLabels = sortedLabels.map((label) => {
    const y = Math.max(label.y, nextY);
    nextY = y + labelGap;

    return { ...label, y };
  });
  const overflow = (positionedLabels.at(-1)?.y ?? 0) - labelMaximumY;
  if (overflow <= 0) {
    return positionedLabels;
  }

  return positionedLabels.map((label) => ({
    ...label,
    y: label.y - overflow,
  }));
}

function formatEventCount(eventCount: number): string {
  return `${eventCount} ${eventCount === 1 ? "EVENT" : "EVENTS"}`;
}

const mapSectionStyle = css`
  width: 50%;
  height: 760px;
`;
const mapStyle = css`
  display: block;
  width: 100%;
  height: 100%;
`;
