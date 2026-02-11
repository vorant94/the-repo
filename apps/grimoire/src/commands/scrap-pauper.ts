import { type ParseArgsConfig, parseArgs } from "node:util";
import { log } from "@clack/prompts";
import { outputFile } from "fs-extra";
import { parseHTML } from "linkedom";
import { z } from "zod";
import { formatDecklistCard } from "../formatters/decklist.ts";
import { accent } from "../shared/logger.ts";

export async function scrapPauper() {
  const { values } = parseArgs({
    options,
    strict: true,
  });

  const { outputPath } = argsSchema.parse(values);

  const html = await fetchTop64Page();

  const cardNames = parseUniqueCardsFromHtml(html);

  const output = formatOutput(cardNames);

  log.step(`Writing to ${accent(outputPath)}...`);

  await outputFile(outputPath, output, "utf-8");

  log.success("Done!");
}

const argsSchema = z.object({
  outputPath: z.string().default("./pauper-staples.txt"),
});

const options = {
  url: { type: "string" },
  outputPath: { type: "string" },
} as const satisfies ParseArgsConfig["options"];

async function fetchTop64Page(): Promise<string> {
  log.step(`Fetching ${accent(url)}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return await response.text();
}

const url = "https://paupergeddon.com/Top64.html";

function parseUniqueCardsFromHtml(html: string): Set<string> {
  log.step("Parsing...");

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

  log.info(`Found ${accent(cardNames.size)} unique cards`);
  return cardNames;
}

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

function formatOutput(cardNames: Set<string>): string {
  log.step("Formatting output...");

  return Array.from(cardNames)
    .sort()
    .map((name) => formatDecklistCard({ quantity: 1, name }))
    .join("\n");
}
