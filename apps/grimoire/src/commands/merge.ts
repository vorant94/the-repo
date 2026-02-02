import { readFile } from "node:fs/promises";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { outputFile } from "fs-extra";
import { z } from "zod";
import { parseCollectionCard } from "../formatters/collection.ts";
import {
  formatDecklistCard,
  parseDecklistCard,
} from "../formatters/decklist.ts";

export async function merge() {
  const { values, positionals } = parseArgs({
    options,
    allowPositionals: true,
    strict: true,
  });

  const deckPaths = positionalsSchema.parse(positionals);
  const { outputPath } = argsSchema.parse(values);

  const decks = await readAndParseDecks(deckPaths);

  const merged = mergeDecks(decks);

  const output = formatOutput(merged);

  console.info(`Writing ${merged.size} cards to ${outputPath}...`);
  await outputFile(outputPath, output, "utf-8");
  console.info("Done!");
}

const positionalsSchema = z.array(z.string()).min(2);

const argsSchema = z.object({
  outputPath: z.string().default("merged-decklist.txt"),
});

const options = {
  outputPath: { type: "string" },
} as const satisfies ParseArgsOptionsConfig;

function readAndParseDecks(
  deckPaths: Array<string>,
): Promise<Array<Map<string, number>>> {
  return Promise.all(
    deckPaths.map(async (deckPath) => {
      console.info(`Reading ${deckPath}...`);
      const deckContent = await readFile(deckPath, "utf-8");

      const deck = parseDeck(deckContent);
      console.info(`Parsed ${deck.size} unique cards from ${deckPath}`);

      return deck;
    }),
  );
}

function parseDeck(deckContent: string): Map<string, number> {
  const deck = new Map<string, number>();

  for (const line of deckContent.split("\n")) {
    // Try collection format first (more specific pattern)
    const parsed = parseCollectionCard(line) ?? parseDecklistCard(line);
    if (!parsed) {
      continue;
    }

    const existing = deck.get(parsed.name) ?? 0;
    deck.set(parsed.name, existing + parsed.quantity);
  }

  return deck;
}

function mergeDecks(decks: Array<Map<string, number>>): Map<string, number> {
  console.info("Merging decklists...");

  const allCards = new Set(decks.flatMap((deck) => Array.from(deck.keys())));
  const merged = new Map<string, number>();

  for (const card of allCards) {
    const maxCount = Math.max(...decks.map((deck) => deck.get(card) ?? 0));
    merged.set(card, maxCount);
  }

  return merged;
}

function formatOutput(merged: Map<string, number>): string {
  return Array.from(merged.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, quantity]) => formatDecklistCard({ quantity, name }))
    .join("\n");
}
