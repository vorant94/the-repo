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
    </section>
  );
};

function formatEventDetails(city: MonthlyReportCitySummary): string {
  const eventLabel = city.eventCount === 1 ? "event" : "events";
  const venueLabel = city.venueCount === 1 ? "venue" : "venues";

  const averagePlayers = city.averagePlayersPerEvent.toFixed(1);

  return `${city.eventCount} ${eventLabel} across ${city.venueCount} ${venueLabel} · ${averagePlayers} players per event on average`;
}

function formatPlayerDetails(city: MonthlyReportCitySummary): string {
  const playerLabel = city.playerCount === 1 ? "player" : "players";
  const archetypeLabel = city.archetypeCount === 1 ? "archetype" : "archetypes";

  return `In total, ${city.playerCount} ${playerLabel} piloted ${city.archetypeCount} different ${archetypeLabel}`;
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
