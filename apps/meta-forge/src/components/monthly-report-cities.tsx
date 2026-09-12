import { css, cx } from "hono/css";
import type { MonthlyReportCitySummary } from "../shared/schema/jobs.ts";

interface MonthlyReportCitiesProps {
  cities: Array<MonthlyReportCitySummary>;
  mode: "dark" | "light";
}

export const MonthlyReportCities = ({
  cities,
  mode,
}: MonthlyReportCitiesProps) => {
  const isDark = mode === "dark";

  return (
    <section class={citiesSectionStyle}>
      <h2 class={headingStyle}>Tournaments accross the country</h2>
      <div class={citiesStyle}>
        {cities.map((city) => (
          <p
            class={cityStyle}
            key={city.name}
          >
            <strong>{city.name}</strong>
            <span class={cx(detailsStyle, isDark && darkDetailsStyle)}>
              {formatEventDetails(city)}
            </span>
            <span class={cx(detailsStyle, isDark && darkDetailsStyle)}>
              {formatPlayerDetails(city)}
            </span>
          </p>
        ))}
      </div>
      <p class={cx(footnoteStyle, isDark && darkDetailsStyle)}>
        Small: {"<8 players"} · Medium: 8–15 players · Large: 16+ players
      </p>
    </section>
  );
};

function formatEventDetails(city: MonthlyReportCitySummary): string {
  const buckets: Array<string> = [
    city.largeEventCount > 0 ? `${city.largeEventCount} large` : null,
    city.mediumEventCount > 0 ? `${city.mediumEventCount} medium` : null,
    city.smallEventCount > 0 ? `${city.smallEventCount} small` : null,
  ].filter((bucket) => bucket !== null);
  const bucketSummary = joinWithAnd(buckets);
  const eventLabel = city.eventCount === 1 ? "event" : "events";
  const venueLabel = city.hostCount === 1 ? "venue" : "venues";

  return `${bucketSummary} ${eventLabel} across ${city.hostCount} ${venueLabel}`;
}

function formatPlayerDetails(city: MonthlyReportCitySummary): string {
  const playerLabel = city.playerCount === 1 ? "player" : "players";
  const archetypeLabel = city.archetypeCount === 1 ? "archetype" : "archetypes";

  return `${city.playerCount} ${playerLabel} piloting ${city.archetypeCount} different ${archetypeLabel}`;
}

function joinWithAnd(values: Array<string>): string {
  if (values.length < 3) {
    return values.join(" and ");
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

const citiesSectionStyle = css`
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 760px;
  padding: 120px 0 0 32px;
`;
const headingStyle = css`
  margin: 0;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.025em;
  text-align: center;
`;
const citiesStyle = css`
  margin-top: 32px;
`;
const cityStyle = css`
  margin: 0 0 22px;
  font-size: 20px;
  line-height: 1.4;
`;
const detailsStyle = css`
  display: block;
  color: #64748b;
  font-size: 16px;
`;
const darkDetailsStyle = css`
  color: #94a3b8;
`;
const footnoteStyle = css`
  margin: auto 0 0;
  padding-bottom: 8px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
`;
