import process from "node:process";
import { outputFile } from "fs-extra";
import { formatPlainText } from "./formatters/plain-text-formatter.ts";
import { scrapeStaples } from "./sites/mtgdecks/scraper.ts";
import type { Format } from "./types.ts";

const site = "mtgdecks";
const format = "Pauper" satisfies Format;
const outputPath = `output/${site}/${format.toLowerCase()}-staples.txt`;

try {
  const cardNames = await scrapeStaples(format);

  console.info("Formatting output...");
  const output = formatPlainText(cardNames);

  console.info(`Writing to ${outputPath}...`);
  await outputFile(outputPath, output, "utf-8");

  console.info("Done!");
} catch (error) {
  console.error("Error:", error);
  process.exit(1);
}
