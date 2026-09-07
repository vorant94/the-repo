import puppeteer from "@cloudflare/puppeteer";
import { renderToString } from "hono/jsx/dom/server";
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
    await page.setContent(
      renderToString(
        <EventReportPreview
          mode="dark"
          report={eventReport}
        />,
      ),
      { waitUntil: "networkidle0" },
    );
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
