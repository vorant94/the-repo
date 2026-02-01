#!/usr/bin/env -S node --experimental-strip-types
import { parseArgs } from "node:util";
import { outputFile } from "fs-extra";
import { parseHTML } from "linkedom";
import { z } from "zod";
import { formatDecklistCard } from "./formatters/decklist.ts";

const basicLands = new Set([
  "Plains",
  "Island",
  "Swamp",
  "Mountain",
  "Forest",
  "Snow-Covered Plains",
  "Snow-Covered Island",
  "Snow-Covered Swamp",
  "Snow-Covered Mountain",
  "Snow-Covered Forest",
]);

// CLI argument schema
const argsSchema = z.object({
  url: z.string().url().default("https://paupergeddon.com/Top64.html"),
  outputPath: z.string().default("pauper-staples.txt"),
});

// Parse and validate command-line arguments
const { values } = parseArgs({
  options: {
    url: { type: "string" },
    outputPath: { type: "string" },
  },
  strict: true,
});

const { url, outputPath } = argsSchema.parse(values);

// Main execution
console.info(`Fetching ${url}...`);

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Failed to fetch ${url}: ${response.status}`);
}

console.info("Parsing...");

const html = await response.text();
const { document } = parseHTML(html);

const cardElements = document.querySelectorAll("span.card-hover");

const cardNames = new Set<string>();
for (const element of cardElements) {
  const text = element.textContent?.trim();
  if (!text) {
    continue;
  }

  // Extract card name by removing quantity prefix (e.g., "4 Fiery Temper" -> "Fiery Temper")
  const parts = text.split(" ");
  const cardName = parts.slice(1).join(" ");
  if (!cardName) {
    continue;
  }

  if (basicLands.has(cardName)) {
    continue;
  }

  cardNames.add(cardName);
}

console.info(`Found ${cardNames.size} unique cards`);

console.info("Formatting output...");

const output = Array.from(cardNames)
  .sort()
  .map((name) => formatDecklistCard({ quantity: 1, name }))
  .join("\n");

console.info(`Writing to ${outputPath}...`);

await outputFile(outputPath, output, "utf-8");

console.info("Done!");
