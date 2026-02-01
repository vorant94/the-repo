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
  deckPaths: z.array(z.string()).min(2),
  outputPath: z.string().default("output/merged/merged-decklist.txt"),
});

// Parse and validate command-line arguments
const { values, positionals } = parseArgs({
  options: {
    outputPath: { type: "string" },
  },
  allowPositionals: true,
  strict: true,
});

const { deckPaths, outputPath } = argsSchema.parse({
  deckPaths: positionals,
  outputPath: values.outputPath,
});

// Main execution
const decks: Array<Map<string, number>> = [];
for (const deckPath of deckPaths) {
  console.info(`Reading ${deckPath}...`);
  const deckContent = await readFile(deckPath, "utf-8");

  const deck = new Map<string, number>();
  for (const line of deckContent.split("\n")) {
    const parsed = parseDecklistCard(line);
    if (!parsed) {
      continue;
    }

    const existing = deck.get(parsed.name) ?? 0;
    deck.set(parsed.name, existing + parsed.quantity);
  }

  console.info(`Parsed ${deck.size} unique cards from ${deckPath}`);
  decks.push(deck);
}

console.info("Merging decklists...");
const allCards = new Set(decks.flatMap((deck) => Array.from(deck.keys())));
const merged = new Map<string, number>();
for (const card of allCards) {
  const maxCount = Math.max(...decks.map((deck) => deck.get(card) ?? 0));
  merged.set(card, maxCount);
}

const output = Array.from(merged.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, quantity]) => formatDecklistCard({ quantity, name }))
  .join("\n");

console.info(`Writing ${merged.size} cards to ${outputPath}...`);
await outputFile(outputPath, output, "utf-8");
console.info("Done!");
