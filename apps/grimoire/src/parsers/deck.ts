import { z } from "zod";
import { type DeckCard, deckCardSchema } from "../schemas/deck.ts";

export function parseDeck(content: string): Array<DeckCard> {
  const deck: Array<DeckCard> = [];
  let zone: DeckCard["zone"] = "mainboard";

  for (const line of content.split("\n")) {
    if (line.trim() === "Sideboard") {
      zone = "sideboard";
      continue;
    }

    const names = parseDeckLine(line);
    if (!names) {
      continue;
    }

    for (const name of names) {
      deck.push({ name, zone });
    }
  }

  return deck;
}

export function parseDeckLine(line: string): Array<string> | null {
  const normalized = line.trim();
  const separator = normalized.indexOf(" ");
  if (separator < 0) {
    return null;
  }

  const rawQuantity = normalized.slice(0, separator);
  if (!/^\d+$/.test(rawQuantity)) {
    return null;
  }

  const { name, quantity } = deckLineSchema.parse({
    name: normalized.slice(separator + 1).trim(),
    quantity: rawQuantity,
  });
  return Array.from({ length: quantity }, () => name);
}

export function countDeckCardsByName(
  deck: Array<DeckCard>,
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const card of deck) {
    const quantity = (counts.get(card.name) ?? 0) + 1;
    counts.set(card.name, quantity);
  }

  return counts;
}

const deckLineSchema = deckCardSchema.omit({ zone: true }).extend({
  quantity: z.coerce.number().int().nonnegative(),
});
