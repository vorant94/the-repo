export function merge(decks: Array<Map<string, number>>): string {
  const merged = new Map<string, number>();

  for (const deck of decks) {
    for (const [name, quantity] of deck) {
      merged.set(name, Math.max(merged.get(name) ?? 0, quantity));
    }
  }

  return Array.from(merged)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, quantity]) => `${quantity} ${name}\n`)
    .join("");
}
