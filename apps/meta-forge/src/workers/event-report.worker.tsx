import puppeteer from "@cloudflare/puppeteer";
import { renderToReadableStream } from "hono/jsx/dom/server";
import { EventReportPreview } from "../components/event-report-preview.tsx";
import { getAppContext } from "../shared/app-context.ts";
import { eventReportRenderSize } from "../shared/event-report-render-size.ts";
import { eventReportJobSchema, type Job } from "../shared/schema/jobs.ts";

export async function generateEventReport(job: Job) {
  const { browser: browserBinding, bucket } = getAppContext();
  const eventReportJob = eventReportJobSchema.parse(job);
  const eventReport = eventReportJob.payload;
  const browser = await puppeteer.launch(browserBinding);
  try {
    const page = await browser.newPage();
    await page.setViewport({
      ...eventReportRenderSize,
      deviceScaleFactor: 2,
    });
    const stream = await renderToReadableStream(
      <EventReportPreview
        mode="dark"
        report={eventReport}
      />,
    );
    const response = new Response(stream);
    const html = await response.text();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const screenshot = await page.screenshot({ type: "png" });
    const objectKey = `event-reports/${eventReport.id}/${eventReportJob.id}.png`;
    await bucket.put(objectKey, screenshot, {
      httpMetadata: { contentType: "image/png" },
    });
    return { objectKey };
  } finally {
    await browser.close();
  }
}
