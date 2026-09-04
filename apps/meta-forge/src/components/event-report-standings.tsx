import { css, cx } from "hono/css";
import type { EventReport } from "../queries/find-event-report.ts";

const maximumRowsPerTable = 18;

interface EventReportStandingsProps {
  mode: "dark" | "light";
  report: EventReport;
}

export const EventReportStandings = ({
  mode,
  report,
}: EventReportStandingsProps) => {
  const isDark = mode === "dark";
  const firstTableLength = Math.ceil(report.ranks.length / 2);
  const standingsTables =
    report.ranks.length > maximumRowsPerTable
      ? [
          report.ranks.slice(0, firstTableLength),
          report.ranks.slice(firstTableLength),
        ]
      : [report.ranks];

  return (
    <section class={standingsSectionStyle}>
      <h2 class={headingStyle}>Final standings</h2>
      <div
        class={cx(
          tablesStyle,
          standingsTables.length === 1 ? singleTableStyle : doubleTableStyle,
        )}
      >
        {standingsTables.map((standings, tableIndex) => (
          <table
            class={tableStyle}
            key={standings.at(0)?.player.name ?? "empty-standings"}
          >
            <thead class={cx(tableHeaderStyle, isDark && darkTableHeaderStyle)}>
              <tr>
                <th class={rankStyle}>#</th>
                <th>Player</th>
                <th class={deckStyle}>Deck</th>
                <th class={recordStyle}>W/L/D</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => (
                <tr key={standing.player.name}>
                  <td
                    class={cx(
                      tableCellStyle,
                      rankStyle,
                      isDark && darkTableCellStyle,
                    )}
                  >
                    {tableIndex * firstTableLength + index + 1}
                  </td>
                  <td class={cx(tableCellStyle, isDark && darkTableCellStyle)}>
                    {standing.player.name}
                  </td>
                  <td
                    class={cx(
                      tableCellStyle,
                      deckStyle,
                      isDark && darkDeckStyle,
                    )}
                  >
                    {standing.archetype.name}
                  </td>
                  <td
                    class={cx(
                      tableCellStyle,
                      recordStyle,
                      isDark && darkTableCellStyle,
                    )}
                  >
                    {formatRecord(
                      standing.wins,
                      standing.losses,
                      standing.draws,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </section>
  );
};

const standingsSectionStyle = css`
  width: 50%;
  height: 760px;
  padding-left: 32px;
`;
const headingStyle = css`
  margin: 0;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.025em;
`;
const tablesStyle = css`
  display: grid;
  gap: 16px;
  margin-top: 20px;
`;
const singleTableStyle = css`
  grid-template-columns: 1fr;
`;
const doubleTableStyle = css`
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;
const tableStyle = css`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  table-layout: fixed;
  text-align: left;
`;
const tableHeaderStyle = css`
  border-block: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  th { padding-block: 8px; font-weight: 700; }
`;
const darkTableHeaderStyle = css`
  border-color: #334155;
  color: #94a3b8;
`;
const tableCellStyle = css`
  border-bottom: 1px solid #e2e8f0;
  padding-block: 8px;
  font-weight: 600;
`;
const darkTableCellStyle = css`
  border-color: #1e293b;
  color: #f8fafc;
`;
const rankStyle = css`
  width: 32px;
  font-weight: 700;
`;
const deckStyle = css`
  width: 144px;
  color: #475569;
`;
const darkDeckStyle = css`
  color: #cbd5e1;
`;
const recordStyle = css`
  width: 48px;
  text-align: center;
`;

function formatRecord(wins: number, losses: number, draws: number): string {
  return `${wins}/${losses}/${draws}`;
}
