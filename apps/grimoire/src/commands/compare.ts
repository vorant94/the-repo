import { countDeckCardsByName } from "../parsers/deck.ts";
import type { DeckCard } from "../schemas/deck.ts";

export function compare(decks: Array<Array<DeckCard>>): number {
  const counts = decks.map(countDeckCardsByName);
  let totalCards = 0;
  let sharedCards = 0;

  for (const deck of counts) {
    for (const [name, quantity] of deck) {
      totalCards += quantity;
      if (counts.every((other) => other.has(name))) {
        sharedCards += quantity;
      }
    }
  }

  return totalCards === 0 ? 0 : (sharedCards / totalCards) * 100;
}
