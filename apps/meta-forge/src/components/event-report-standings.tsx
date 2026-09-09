import { css, cx } from "hono/css";
import type { EventReportPayload } from "../shared/schema/jobs.ts";

const maximumRowsPerTable = 18;

interface EventReportStandingsProps {
  mode: "dark" | "light";
  report: EventReportPayload;
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
  const isSingleTable = standingsTables.length === 1;

  return (
    <section class={standingsSectionStyle}>
      <h2 class={headingStyle}>Final standings</h2>
      <div
        class={cx(
          tablesStyle,
          isSingleTable ? singleTableStyle : doubleTableStyle,
        )}
      >
        {standingsTables.map((standings, tableIndex) => (
          <table
            class={cx(tableStyle, isSingleTable && singleTableTextStyle)}
            key={standings.at(0)?.player.name ?? "empty-standings"}
          >
            <thead
              class={cx(
                tableHeaderStyle,
                isSingleTable && singleTableHeaderStyle,
                isDark && darkTableHeaderStyle,
              )}
            >
              <tr>
                <th class={rankStyle}>#</th>
                <th>Player</th>
                <th
                  class={cx(
                    deckColumnStyle,
                    isSingleTable && singleTableDeckColumnStyle,
                  )}
                >
                  Deck
                </th>
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
                      deckColumnStyle,
                      isSingleTable && singleTableDeckColumnStyle,
                      deckCellStyle,
                      isDark && darkDeckStyle,
                    )}
                  >
                    {getArchetypeName(standing)}
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 50%;
  height: 760px;
  padding-left: 32px;
`;
const headingStyle = css`
  margin: 0;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.025em;
  text-align: center;
`;
const tablesStyle = css`
  display: grid;
  gap: 16px;
  margin-top: 20px;
`;
const singleTableStyle = css`
  grid-template-columns: minmax(0, 70%);
  justify-content: center;
`;
const doubleTableStyle = css`
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;
const tableStyle = css`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
  text-align: left;
`;
const singleTableTextStyle = css`
  font-size: 18px;
`;
const tableHeaderStyle = css`
  border-block: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  th { padding-block: 8px; font-weight: 700; }
`;
const singleTableHeaderStyle = css`
  font-size: 14px;
`;
const darkTableHeaderStyle = css`
  border-color: #334155;
  color: #94a3b8;
`;
const tableCellStyle = css`
  padding-block: 8px;
  font-weight: 600;
`;
const darkTableCellStyle = css`
  color: #f8fafc;
`;
const rankStyle = css`
  width: 32px;
  font-weight: 700;
`;
const deckColumnStyle = css`
  width: 144px;
`;
const singleTableDeckColumnStyle = css`
  width: 174.24px;
`;
const deckCellStyle = css`
  color: #475569;
  font-weight: 400;
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

function getArchetypeName(
  standing: EventReportPayload["ranks"][number],
): string {
  if (standing.isArchetypeHidden) {
    return "Homebrew";
  }

  return standing.archetype.name;
}
