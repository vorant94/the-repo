import { outputFile } from "fs-extra";
import { formatPlainText } from "./formatters/plain-text-formatter.ts";
import { scrapeTop64Cards } from "./sites/paupergeddon/scraper.ts";

const site = "paupergeddon";
const format = "pauper";
const outputPath = `output/${site}/${format}-staples.txt`;

const cardNames = await scrapeTop64Cards();

console.info("Formatting output...");
const output = formatPlainText(cardNames);

console.info(`Writing to ${outputPath}...`);
await outputFile(outputPath, output, "utf-8");

console.info("Done!");
