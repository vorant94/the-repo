import puppeteer from "@cloudflare/puppeteer";
import { renderToReadableStream } from "hono/jsx/dom/server";
import { EventReportPreview } from "../components/event-report-preview.tsx";
import { eventReportRenderSize } from "../shared/event-report-render-size.ts";
import type { EventReportJob } from "../shared/schema/jobs.ts";

export async function processEventReportGeneration(
  job: EventReportJob,
  browserBinding: CloudflareBindings["BROWSER"],
  bucket: R2Bucket,
) {
  const eventReport = job.payload;
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
    const objectKey = `event-reports/${eventReport.id}/${job.id}.png`;
    await bucket.put(objectKey, screenshot, {
      httpMetadata: { contentType: "image/png" },
    });
    return { objectKey };
  } finally {
    await browser.close();
  }
}
