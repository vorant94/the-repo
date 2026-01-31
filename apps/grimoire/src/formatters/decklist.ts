export interface DecklistCard {
  quantity: number;
  name: string;
}

// Parse a single decklist line
// Format: "4 Lightning Bolt"
// Returns null for unparseable lines
export function parseDecklistCard(line: string): DecklistCard | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return null;
  }

  const quantityStr = trimmed.slice(0, spaceIndex);
  const quantity = Number.parseInt(quantityStr, 10);
  if (Number.isNaN(quantity) || quantity <= 0) {
    return null;
  }

  const name = trimmed.slice(spaceIndex + 1).trim();
  if (!name) {
    return null;
  }

  return { quantity, name };
}

// Format a card for decklist output
// Format: "4 Lightning Bolt"
export function formatDecklistCard(card: DecklistCard): string {
  return `${card.quantity} ${card.name}`;
}
