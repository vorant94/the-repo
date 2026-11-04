import { countDeckCardsByName } from "../parsers/deck.ts";
import type { DeckCard } from "../schemas/deck.ts";

export function formatDeck(deck: Array<DeckCard>): string {
  const lines: Array<string> = [];

  for (const zone of ["mainboard", "sideboard"] as const) {
    const cards = deck.filter((card) => card.zone === zone);
    if (cards.length === 0) {
      continue;
    }

    if (zone === "sideboard") {
      if (lines.length > 0) {
        lines.push("");
      }
      lines.push("Sideboard");
    }

    const counts = countDeckCardsByName(cards);
    for (const [name, quantity] of counts) {
      lines.push(`${quantity} ${name}`);
    }
  }

  if (lines.length === 0) {
    return "";
  }
  return `${lines.join("\n")}\n`;
}
