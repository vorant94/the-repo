export function compare(decks: Array<Map<string, number>>): string {
  let totalCards = 0;
  let sharedCards = 0;

  for (const deck of decks) {
    for (const [name, quantity] of deck) {
      totalCards += quantity;
      if (decks.every((other) => other.has(name))) {
        sharedCards += quantity;
      }
    }
  }

  const similarity = totalCards === 0 ? 0 : (sharedCards / totalCards) * 100;
  return `Deck similarity: ${similarity.toFixed(2)}%\n`;
}
