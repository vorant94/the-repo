import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { outputFile } from "fs-extra";
import { z } from "zod";
import {
  formatDecklistCard,
  parseDecklistCard,
} from "./formatters/decklist.ts";

// CLI argument schema
const argsSchema = z.object({
  deckPathA: z.string(),
  deckPathB: z.string(),
  outputPath: z.string().default("output/merged/merged-decklist.txt"),
});

// Parse and validate command-line arguments
const { values } = parseArgs({
  options: {
    deckPathA: { type: "string" },
    deckPathB: { type: "string" },
    outputPath: { type: "string" },
  },
  strict: true,
});

const { deckPathA, deckPathB, outputPath } = argsSchema.parse(values);

function parseDecklistFile(content: string): Map<string, number> {
  const cards = new Map<string, number>();

  for (const line of content.split("\n")) {
    const parsed = parseDecklistCard(line);
    if (!parsed) {
      continue;
    }

    const existing = cards.get(parsed.name) ?? 0;
    cards.set(parsed.name, existing + parsed.quantity);
  }

  return cards;
}

function mergeDecklists(
  deckA: Map<string, number>,
  deckB: Map<string, number>,
): Map<string, number> {
  const merged = new Map<string, number>();
  const allCards = new Set([...deckA.keys(), ...deckB.keys()]);

  for (const card of allCards) {
    const countA = deckA.get(card) ?? 0;
    const countB = deckB.get(card) ?? 0;
    merged.set(card, Math.max(countA, countB));
  }

  return merged;
}

// Main execution
console.info(`Reading ${deckPathA}...`);
const deckContentA = await readFile(deckPathA, "utf-8");
const deckA = parseDecklistFile(deckContentA);
console.info(`Parsed ${deckA.size} unique cards from deck A`);

console.info(`Reading ${deckPathB}...`);
const deckContentB = await readFile(deckPathB, "utf-8");
const deckB = parseDecklistFile(deckContentB);
console.info(`Parsed ${deckB.size} unique cards from deck B`);

console.info("Merging decklists...");
const merged = mergeDecklists(deckA, deckB);

const output = Array.from(merged.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, quantity]) => formatDecklistCard({ quantity, name }))
  .join("\n");

console.info(`Writing ${merged.size} cards to ${outputPath}...`);
await outputFile(outputPath, output, "utf-8");
console.info("Done!");
