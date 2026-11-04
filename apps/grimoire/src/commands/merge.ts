import { countDeckCardsByName } from "../parsers/deck.ts";
import type { DeckCard } from "../schemas/deck.ts";

export function merge(decks: Array<Array<DeckCard>>): Array<DeckCard> {
  const maximums = new Map<string, number>();
  const merged: Array<DeckCard> = [];

  for (const deck of decks) {
    const counts = countDeckCardsByName(deck);
    for (const [name, quantity] of counts) {
      maximums.set(name, Math.max(maximums.get(name) ?? 0, quantity));
    }
  }

  const sorted = Array.from(maximums).sort(([a], [b]) => a.localeCompare(b));
  for (const [name, quantity] of sorted) {
    for (let index = 0; index < quantity; index += 1) {
      merged.push({ name, zone: "mainboard" });
    }
  }

  return merged;
}
