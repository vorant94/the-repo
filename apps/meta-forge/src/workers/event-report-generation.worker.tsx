import puppeteer from "@cloudflare/puppeteer";
import { renderToReadableStream } from "hono/jsx/dom/server";
import { EventReportPreview } from "../components/event-report-preview.tsx";
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
    await page.setViewport({ width: 1440, height: 1800, deviceScaleFactor: 2 });
    const stream = await renderToReadableStream(
      <EventReportPreview
        mode="dark"
        report={eventReport}
      />,
    );
    const response = new Response(stream);
    const html = await response.text();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const screenshot = await page.screenshot({ fullPage: true, type: "png" });
    const objectKey = `event-report-generation-results/${eventReport.id}/${job.id}.png`;
    await bucket.put(objectKey, screenshot, {
      httpMetadata: { contentType: "image/png" },
    });
    return { objectKey };
  } finally {
    await browser.close();
  }
}
