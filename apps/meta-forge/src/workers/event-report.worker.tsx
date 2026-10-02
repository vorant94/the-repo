import puppeteer from "@cloudflare/puppeteer";
import { renderToReadableStream } from "hono/jsx/dom/server";
import { EventReportPreview } from "../components/event-report-preview.tsx";
import { getAppContext } from "../shared/app-context.ts";
import {
  type EventReportPage,
  getEventReportPages,
} from "../shared/event-report-pages.ts";
import { reportRenderSize } from "../shared/report-render-size.ts";
import { eventReportJobSchema, type Job } from "../shared/schema/jobs.ts";

export async function generateEventReport(job: Job) {
  const { browser: browserBinding, bucket } = getAppContext();
  const eventReportJob = eventReportJobSchema.parse(job);
  const eventReport = eventReportJob.payload;
  const browser = await puppeteer.launch(browserBinding);
  try {
    const page = await browser.newPage();
    await page.setViewport({
      ...reportRenderSize,
      deviceScaleFactor: 2,
    });
    const pages = getEventReportPages(eventReport.ranks.length);
    const results: Array<{
      kind: EventReportPage["kind"];
      objectKey: string;
    }> = [];
    for (const [index, reportPage] of pages.entries()) {
      const stream = await renderToReadableStream(
        <EventReportPreview
          mode="dark"
          page={reportPage}
          report={eventReport}
        />,
      );
      const response = new Response(stream);
      const html = await response.text();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const screenshot = await page.screenshot({ type: "png" });
      const pageNumber = String(index + 1).padStart(2, "0");
      const objectKey = `event-reports/${eventReport.id}/${eventReportJob.id}/${pageNumber}-${reportPage.kind}.png`;
      await bucket.put(objectKey, screenshot, {
        httpMetadata: { contentType: "image/png" },
      });
      results.push({ kind: reportPage.kind, objectKey });
    }

    return { pages: results };
  } finally {
    await browser.close();
  }
}
