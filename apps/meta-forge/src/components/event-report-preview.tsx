import { css, cx, Style } from "hono/css";
import type { EventReport } from "../queries/find-event-report.ts";
import { EventReportChart } from "./event-report-chart.tsx";
import { EventReportStandings } from "./event-report-standings.tsx";

interface EventReportPreviewProps {
  mode: "dark" | "light";
  report: EventReport;
}

export const EventReportPreview = ({
  mode,
  report,
}: EventReportPreviewProps) => {
  const isDark = mode === "dark";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>{`${report.name} — Pauper meta report`}</title>
        <Style>{globalStyles}</Style>
      </head>
      <body>
        <article class={cx(reportStyle, isDark && darkReportStyle)}>
          <header class={cx(headerStyle, isDark && darkHeaderStyle)}>
            <div>
              <p class={cx(eyebrowStyle, isDark && darkEyebrowStyle)}>
                Pauper meta report
              </p>
              <h1 class={titleStyle}>{report.name}</h1>
            </div>
            <div class={cx(eventDetailsStyle, isDark && darkEventDetailsStyle)}>
              <p>{report.host.name}</p>
              <p>{formatEventDate(report.hostedAt)}</p>
            </div>
          </header>
          <main class={mainStyle}>
            <EventReportChart
              mode={mode}
              report={report}
            />
            <EventReportStandings
              mode={mode}
              report={report}
            />
          </main>
        </article>
      </body>
    </html>
  );
};

function formatEventDate(date: string): string {
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
    new Date(date),
  );
}

const globalStyles = css`
  * { box-sizing: border-box; }
  body { margin: 0; background: #e2e8f0; color: #020617; font-family: Arial, sans-serif; }
`;
const reportStyle = css`
  width: 1920px;
  min-height: 1080px;
  margin: 0 auto;
  padding: 64px;
  background: #f8fafc;
`;
const darkReportStyle = css`
  background: #020617;
  color: #f8fafc;
`;
const headerStyle = css`
  display: flex;
  align-items: end;
  justify-content: space-between;
  border-bottom: 4px solid #020617;
  padding-bottom: 24px;
`;
const darkHeaderStyle = css`
  border-color: #f8fafc;
`;
const eyebrowStyle = css`
  margin: 0;
  color: #ea580c;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`;
const darkEyebrowStyle = css`
  color: #fb923c;
`;
const titleStyle = css`
  margin: 8px 0 0;
  font-size: 60px;
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1;
`;
const eventDetailsStyle = css`
  color: #475569;
  font-size: 20px;
  font-weight: 600;
  text-align: right;
`;
const darkEventDetailsStyle = css`
  color: #94a3b8;
`;
const mainStyle = css`
  display: flex;
  margin-top: 32px;
`;
