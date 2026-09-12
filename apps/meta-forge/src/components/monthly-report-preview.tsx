import { css, cx, Style } from "hono/css";
import { reportRenderSize } from "../shared/report-render-size.ts";
import type { MonthlyReportPayload } from "../shared/schema/jobs.ts";
import { MonthlyReportCities } from "./monthly-report-cities.tsx";
import { MonthlyReportMap } from "./monthly-report-map.tsx";

interface MonthlyReportPreviewProps {
  mode: "dark" | "light";
  report: MonthlyReportPayload;
}

export const MonthlyReportPreview = ({
  mode,
  report,
}: MonthlyReportPreviewProps) => {
  const isDark = mode === "dark";
  const formattedMonth = formatMonth(report.month);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>{`${formattedMonth} — Israel Pauper monthly report`}</title>
        <Style>{globalStyles}</Style>
      </head>
      <body>
        <article class={cx(reportStyle, isDark && darkReportStyle)}>
          <header class={cx(headerStyle, isDark && darkHeaderStyle)}>
            <div>
              <p class={cx(eyebrowStyle, isDark && darkEyebrowStyle)}>
                Pauper monthly report
              </p>
              <h1 class={titleStyle}>{formattedMonth}</h1>
            </div>
          </header>
          <main class={mainStyle}>
            <MonthlyReportMap
              hosts={report.hosts}
              mode={mode}
            />
            <MonthlyReportCities
              cities={report.cities}
              mode={mode}
            />
          </main>
        </article>
      </body>
    </html>
  );
};

function formatMonth(month: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${month}T00:00:00Z`));
}

const globalStyles = css`
  * { box-sizing: border-box; }
  body { margin: 0; background: #e2e8f0; color: #020617; font-family: Arial, sans-serif; }
`;
const reportStyle = css`
  width: ${reportRenderSize.width}px;
  height: ${reportRenderSize.height}px;
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
const mainStyle = css`
  display: flex;
  margin-top: 32px;
`;
