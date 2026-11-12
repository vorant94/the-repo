import { countDeckCardsByName } from "../parsers/deck.ts";
import type { DeckCard } from "../schemas/deck.ts";

interface Comparison {
  similarity: number;
  shared: Array<DeckCard>;
  differences: Array<Array<DeckCard>>;
}

export function compare(decks: Array<Array<DeckCard>>): Comparison {
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

  const sharedCounts = new Map<string, number>();
  for (const [name, quantity] of counts[0] ?? []) {
    const sharedQuantity = Math.min(
      quantity,
      ...counts.map((deck) => deck.get(name) ?? 0),
    );
    sharedCounts.set(name, sharedQuantity);
  }

  const shared: Array<DeckCard> = [];
  const differences = decks.map((deck, deckIndex) => {
    const remaining = new Map(sharedCounts);
    const difference: Array<DeckCard> = [];

    for (const card of deck) {
      const quantity = remaining.get(card.name) ?? 0;
      if (quantity === 0) {
        difference.push({ name: card.name, zone: "mainboard" });
        continue;
      }

      remaining.set(card.name, quantity - 1);
      if (deckIndex === 0) {
        shared.push({ name: card.name, zone: "mainboard" });
      }
    }

    return difference;
  });

  return {
    similarity: totalCards === 0 ? 0 : (sharedCards / totalCards) * 100,
    shared,
    differences,
  };
}
