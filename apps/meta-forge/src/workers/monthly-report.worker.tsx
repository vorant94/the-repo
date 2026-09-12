import puppeteer from "@cloudflare/puppeteer";
import { renderToReadableStream } from "hono/jsx/dom/server";
import { MonthlyReportPreview } from "../components/monthly-report-preview.tsx";
import { getAppContext } from "../shared/app-context.ts";
import { reportRenderSize } from "../shared/report-render-size.ts";
import { type Job, monthlyReportJobSchema } from "../shared/schema/jobs.ts";

export async function generateMonthlyReport(job: Job) {
  const { browser: browserBinding, bucket } = getAppContext();
  const monthlyReportJob = monthlyReportJobSchema.parse(job);
  const monthlyReport = monthlyReportJob.payload;
  const browser = await puppeteer.launch(browserBinding);
  try {
    const page = await browser.newPage();
    await page.setViewport({
      ...reportRenderSize,
      deviceScaleFactor: 2,
    });
    const stream = await renderToReadableStream(
      <MonthlyReportPreview
        mode="dark"
        report={monthlyReport}
      />,
    );
    const response = new Response(stream);
    const html = await response.text();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const screenshot = await page.screenshot({ type: "png" });
    const objectKey = `monthly-reports/${monthlyReport.month}/${monthlyReportJob.id}.png`;
    await bucket.put(objectKey, screenshot, {
      httpMetadata: { contentType: "image/png" },
    });
    return { objectKey };
  } finally {
    await browser.close();
  }
}
